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
  vm.runInNewContext(transpiled, { exports, require: (n) => deps[n] || {}, Date, Math, RegExp });
  return exports;
}

const roles = load('lib/workspaces/roles.ts');
const plans = load('lib/billing/plans.ts');

test('workspace slug generation formats strings and enforces clean URL-safe slugs', () => {
  assert.equal(roles.generateWorkspaceSlug('Medical Study Group 2026!'), 'medical-study-group-2026');
  assert.equal(roles.generateWorkspaceSlug('  Cardiology & Neurology  '), 'cardiology-neurology');
  assert.equal(roles.generateWorkspaceSlug('---Awesome---Team---'), 'awesome-team');

  assert.equal(roles.isValidWorkspaceSlug('med-study'), true);
  assert.equal(roles.isValidWorkspaceSlug('team123'), true);
  assert.equal(roles.isValidWorkspaceSlug('ab'), false); // too short (<3)
  assert.equal(roles.isValidWorkspaceSlug('a'.repeat(55)), false); // too long (>48)
  assert.equal(roles.isValidWorkspaceSlug('-invalid-start'), false);
  assert.equal(roles.isValidWorkspaceSlug('invalid-end-'), false);
  assert.equal(roles.isValidWorkspaceSlug('invalid spaces'), false);
});

test('workspace roles permission matrix correctly gates admin, member, and viewer actions', () => {
  // canManageWorkspace
  assert.equal(roles.canManageWorkspace('ADMIN'), true);
  assert.equal(roles.canManageWorkspace('MEMBER'), false);
  assert.equal(roles.canManageWorkspace('VIEWER'), false);
  assert.equal(roles.canManageWorkspace(undefined), false);

  // canInviteMembers
  assert.equal(roles.canInviteMembers('ADMIN'), true);
  assert.equal(roles.canInviteMembers('MEMBER'), false);
  assert.equal(roles.canInviteMembers('VIEWER'), false);

  // canCreateTeamContent
  assert.equal(roles.canCreateTeamContent('ADMIN'), true);
  assert.equal(roles.canCreateTeamContent('MEMBER'), true);
  assert.equal(roles.canCreateTeamContent('VIEWER'), false);

  // canViewTeamContent
  assert.equal(roles.canViewTeamContent('ADMIN'), true);
  assert.equal(roles.canViewTeamContent('MEMBER'), true);
  assert.equal(roles.canViewTeamContent('VIEWER'), true);
  assert.equal(roles.canViewTeamContent('UNKNOWN'), false);
});

test('workspace capacity is capped at 10 members and Scholar plan is required', () => {
  assert.equal(roles.MAX_WORKSPACE_MEMBERS, 10);

  // Plan feature check for workspaces
  const freeProfile = { plan: 'FREE', subscription_status: 'ACTIVE' };
  const proProfile = { plan: 'PRO', subscription_status: 'ACTIVE' };
  const scholarProfile = { plan: 'SCHOLAR', subscription_status: 'ACTIVE' };

  assert.equal(plans.hasPlanFeature(freeProfile, 'workspaces'), false);
  assert.equal(plans.hasPlanFeature(proProfile, 'workspaces'), false);
  assert.equal(plans.hasPlanFeature(scholarProfile, 'workspaces'), true);
});
