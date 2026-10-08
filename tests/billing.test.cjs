const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, deps = {}) {
  const exports = {};
  const code = fs.readFileSync(file, 'utf8');
  const transpiled = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(transpiled, { exports, require: n => deps[n] || {}, Date, Math });
  return exports;
}

const plans = load('lib/billing/plans.ts');
const webhook = load('lib/billing/webhook-processor.ts');

const now = new Date('2026-10-08T12:00:00.000Z');

test('Free plan enforces 10 quizzes and 5 decks quota; Pro and Scholar have unlimited limits', () => {
  const freeProfile = { plan: 'FREE', subscription_status: 'INACTIVE' };
  assert.equal(plans.canCreateQuiz(freeProfile, 0, now), true);
  assert.equal(plans.canCreateQuiz(freeProfile, 9, now), true);
  assert.equal(plans.canCreateQuiz(freeProfile, 10, now), false);
  assert.equal(plans.canCreateQuiz(freeProfile, 15, now), false);

  assert.equal(plans.canCreateDeck(freeProfile, 0, now), true);
  assert.equal(plans.canCreateDeck(freeProfile, 4, now), true);
  assert.equal(plans.canCreateDeck(freeProfile, 5, now), false);

  const proProfile = { plan: 'PRO', subscription_status: 'ACTIVE' };
  assert.equal(plans.canCreateQuiz(proProfile, 100, now), true);
  assert.equal(plans.canCreateDeck(proProfile, 100, now), true);

  const scholarProfile = { plan: 'SCHOLAR', subscription_status: 'ACTIVE' };
  assert.equal(plans.canCreateQuiz(scholarProfile, 500, now), true);
  assert.equal(plans.canCreateDeck(scholarProfile, 500, now), true);
});

test('7-day trial activates Pro tier and accurately expires back to Free after end date', () => {
  const activeTrial = {
    plan: 'PRO',
    subscription_status: 'TRIALING',
    trial_ends_at: '2026-10-15T12:00:00.000Z',
  };
  assert.equal(plans.isTrialActive(activeTrial, now), true);
  assert.equal(plans.getTrialDaysRemaining(activeTrial, now), 7);
  assert.equal(plans.getEffectivePlan(activeTrial, now), 'PRO');
  assert.equal(plans.canCreateQuiz(activeTrial, 15, now), true);

  // 3 days later
  const threeDaysLater = new Date('2026-10-11T12:00:00.000Z');
  assert.equal(plans.getTrialDaysRemaining(activeTrial, threeDaysLater), 4);
  assert.equal(plans.getEffectivePlan(activeTrial, threeDaysLater), 'PRO');

  // Expired trial (after Oct 15)
  const afterTrial = new Date('2026-10-16T12:00:00.000Z');
  assert.equal(plans.isTrialActive(activeTrial, afterTrial), false);
  assert.equal(plans.getTrialDaysRemaining(activeTrial, afterTrial), 0);
  assert.equal(plans.getEffectivePlan(activeTrial, afterTrial), 'FREE');
  assert.equal(plans.canCreateQuiz(activeTrial, 10, afterTrial), false);
});

test('feature permissions gate PDF/Anki exports, advanced analytics, ad-free, and team workspaces', () => {
  const freeProfile = { plan: 'FREE', subscription_status: 'INACTIVE' };
  assert.equal(plans.hasPlanFeature(freeProfile, 'exportPdfAnki', now), false);
  assert.equal(plans.hasPlanFeature(freeProfile, 'advancedAnalytics', now), false);
  assert.equal(plans.hasPlanFeature(freeProfile, 'adFree', now), false);
  assert.equal(plans.hasPlanFeature(freeProfile, 'workspaces', now), false);

  const proProfile = { plan: 'PRO', subscription_status: 'ACTIVE' };
  assert.equal(plans.hasPlanFeature(proProfile, 'exportPdfAnki', now), true);
  assert.equal(plans.hasPlanFeature(proProfile, 'advancedAnalytics', now), true);
  assert.equal(plans.hasPlanFeature(proProfile, 'adFree', now), true);
  assert.equal(plans.hasPlanFeature(proProfile, 'workspaces', now), false);

  const scholarProfile = { plan: 'SCHOLAR', subscription_status: 'ACTIVE' };
  assert.equal(plans.hasPlanFeature(scholarProfile, 'exportPdfAnki', now), true);
  assert.equal(plans.hasPlanFeature(scholarProfile, 'workspaces', now), true);
  assert.equal(plans.hasPlanFeature(scholarProfile, 'prioritySupport', now), true);
});

test('Stripe webhook processor parses checkout sessions, updates, and cancellations', () => {
  const checkoutEvent = {
    type: 'checkout.session.completed',
    data: {
      object: {
        client_reference_id: 'user_123',
        customer: 'cus_xyz',
        subscription: 'sub_abc',
        metadata: {
          plan: 'PRO',
          billingCycle: 'annual',
        },
      },
    },
  };
  const activated = webhook.processStripeWebhookEvent(checkoutEvent);
  assert.equal(activated.action, 'ACTIVATE');
  assert.equal(activated.userId, 'user_123');
  assert.equal(activated.stripeCustomerId, 'cus_xyz');
  assert.equal(activated.stripeSubscriptionId, 'sub_abc');
  assert.equal(activated.plan, 'PRO');
  assert.equal(activated.billingCycle, 'annual');
  assert.equal(activated.isPremium, true);

  const updateEvent = {
    type: 'customer.subscription.updated',
    data: {
      object: {
        id: 'sub_abc',
        customer: 'cus_xyz',
        status: 'past_due',
        current_period_end: 1792065600,
      },
    },
  };
  const updated = webhook.processStripeWebhookEvent(updateEvent);
  assert.equal(updated.action, 'UPDATE');
  assert.equal(updated.subscriptionStatus, 'PAST_DUE');
  assert.equal(updated.isPremium, false);

  const deleteEvent = {
    type: 'customer.subscription.deleted',
    data: {
      object: {
        id: 'sub_abc',
        customer: 'cus_xyz',
      },
    },
  };
  const deleted = webhook.processStripeWebhookEvent(deleteEvent);
  assert.equal(deleted.action, 'CANCEL');
  assert.equal(deleted.subscriptionStatus, 'CANCELED');
  assert.equal(deleted.plan, 'FREE');
  assert.equal(deleted.isPremium, false);

  const unknownEvent = {
    type: 'invoice.payment_succeeded',
    data: { object: {} },
  };
  assert.equal(webhook.processStripeWebhookEvent(unknownEvent).action, 'IGNORED');
});
