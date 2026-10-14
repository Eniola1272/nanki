import type { Quiz, Deck, Question } from '@/types/nanki';

/**
 * Escapes HTML entities for safe inclusion in print documents.
 */
function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Opens a print-formatted window and initiates PDF printing for a quiz.
 */
export function printQuizWorksheet(quiz: Quiz, options: { includeAnswers?: boolean } = {}) {
  if (typeof window === 'undefined') return;

  const includeAnswers = options.includeAnswers ?? false;
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate printable PDF.');
    return;
  }

  const questionsHtml = (quiz.questions || [])
    .map((q: Question, idx: number) => {
      let optionsMarkup = '';

      if (q.type === 'true-false') {
        optionsMarkup = `
          <div class="tf-options">
            ${(q.options || [])
              .map((opt, optIdx) => {
                const letter = String.fromCharCode(65 + optIdx);
                return `
                  <div class="tf-item">
                    <span class="opt-label">${letter}.</span>
                    <span class="opt-text">${escapeHtml(opt)}</span>
                    <span class="tf-boxes">[ T ] [ F ]</span>
                  </div>
                `;
              })
              .join('')}
          </div>
        `;
      } else {
        optionsMarkup = `
          <div class="mc-options">
            ${(q.options || [])
              .map((opt, optIdx) => {
                const letter = String.fromCharCode(65 + optIdx);
                return `
                  <div class="mc-item">
                    <span class="opt-bubble">${letter}</span>
                    <span class="opt-text">${escapeHtml(opt)}</span>
                  </div>
                `;
              })
              .join('')}
          </div>
        `;
      }

      return `
        <div class="question-block">
          <div class="question-header">
            <span class="q-number">Question ${idx + 1}</span>
          </div>
          <div class="question-text">${escapeHtml(q.text)}</div>
          ${optionsMarkup}
        </div>
      `;
    })
    .join('');

  let answerKeyHtml = '';
  if (includeAnswers) {
    answerKeyHtml = `
      <div class="page-break"></div>
      <div class="answer-key-section">
        <h2 class="section-title">Answer Key &amp; Explanations</h2>
        <div class="answers-grid">
          ${(quiz.questions || [])
            .map((q: Question, idx: number) => {
              if (q.type === 'true-false') {
                return `
                  <div class="answer-item">
                    <strong>Q${idx + 1}:</strong>
                    <div class="tf-answers-list">
                      ${(q.options || [])
                        .map((opt, optIdx) => {
                          const letter = String.fromCharCode(65 + optIdx);
                          const truth = q.correctTruthValues?.[optIdx] ?? false;
                          const branchExpl = q.branchExplanations?.[optIdx] ? ` - ${escapeHtml(q.branchExplanations[optIdx])}` : '';
                          return `<div>${letter}. <strong>${truth ? 'TRUE' : 'FALSE'}</strong>${branchExpl}</div>`;
                        })
                        .join('')}
                    </div>
                    ${q.explanation ? `<p class="explanation"><em>Explanation:</em> ${escapeHtml(q.explanation)}</p>` : ''}
                  </div>
                `;
              } else {
                const letter = String.fromCharCode(65 + q.correctOptionIndex);
                const optText = q.options[q.correctOptionIndex] || '';
                return `
                  <div class="answer-item">
                    <strong>Q${idx + 1}:</strong> <span class="badge">${letter}</span> ${escapeHtml(optText)}
                    ${q.explanation ? `<p class="explanation"><em>Explanation:</em> ${escapeHtml(q.explanation)}</p>` : ''}
                  </div>
                `;
              }
            })
            .join('')}
        </div>
      </div>
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(quiz.title)} - Nanki Study Sheet</title>
      <style>
        @page {
          size: A4;
          margin: 1.5cm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1a1a1a;
          line-height: 1.5;
          margin: 0;
          padding: 20px;
          background: #fff;
        }
        .header {
          border-bottom: 2px solid #2563eb;
          padding-bottom: 12px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .brand {
          font-size: 14px;
          font-weight: 800;
          color: #2563eb;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .title {
          font-size: 22px;
          font-weight: bold;
          margin: 4px 0;
          color: #0f172a;
        }
        .meta {
          font-size: 12px;
          color: #64748b;
        }
        .student-fields {
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 8px 14px;
          display: flex;
          gap: 20px;
          font-size: 11px;
          color: #475569;
        }
        .student-fields div {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .line-slot {
          border-bottom: 1px solid #94a3b8;
          width: 140px;
          display: inline-block;
          height: 14px;
        }
        .question-block {
          page-break-inside: avoid;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 14px 16px;
          margin-bottom: 16px;
          background: #fafafa;
        }
        .question-header {
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #2563eb;
          margin-bottom: 4px;
        }
        .question-text {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #0f172a;
        }
        .mc-options {
          display: grid;
          grid-template-columns: 1fr;
          gap: 6px;
        }
        .mc-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }
        .opt-bubble {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 1.5px solid #94a3b8;
          font-size: 10px;
          font-weight: bold;
          color: #475569;
        }
        .tf-options {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .tf-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          border-bottom: 1px dashed #e2e8f0;
          padding-bottom: 4px;
        }
        .tf-boxes {
          font-family: monospace;
          font-weight: bold;
          color: #64748b;
          letter-spacing: 2px;
        }
        .page-break {
          page-break-before: always;
        }
        .answer-key-section {
          margin-top: 30px;
        }
        .section-title {
          font-size: 18px;
          color: #0f172a;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 8px;
          margin-bottom: 16px;
        }
        .answer-item {
          page-break-inside: avoid;
          font-size: 12px;
          margin-bottom: 12px;
          padding: 8px 12px;
          background: #f1f5f9;
          border-radius: 6px;
        }
        .badge {
          display: inline-block;
          background: #2563eb;
          color: #fff;
          font-weight: bold;
          padding: 1px 6px;
          border-radius: 4px;
        }
        .explanation {
          margin: 4px 0 0;
          font-size: 11px;
          color: #475569;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }
        .print-bar {
          background: #0f172a;
          color: #fff;
          padding: 12px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .btn-print {
          background: #2563eb;
          color: #fff;
          border: none;
          padding: 8px 18px;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <div class="print-bar no-print">
        <span>Print Preview &bull; ${escapeHtml(quiz.title)}</span>
        <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
      </div>

      <div class="header">
        <div>
          <div class="brand">Nanki Medical &bull; Study Worksheet</div>
          <h1 class="title">${escapeHtml(quiz.title)}</h1>
          <div class="meta">Category: ${escapeHtml(quiz.category)} &bull; ${quiz.questions.length} Questions</div>
        </div>
        <div class="student-fields">
          <div><span>Name:</span> <span class="line-slot"></span></div>
          <div><span>Date:</span> <span class="line-slot" style="width: 80px;"></span></div>
          <div><span>Score:</span> <span class="line-slot" style="width: 50px;"></span></div>
        </div>
      </div>

      <div class="questions-container">
        ${questionsHtml}
      </div>

      ${answerKeyHtml}
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Opens a print-formatted window for a flashcard deck.
 */
export function printDeckCards(deck: Deck) {
  if (typeof window === 'undefined') return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate printable PDF.');
    return;
  }

  const cardsHtml = (deck.cards || [])
    .map((c, idx) => `
      <div class="flashcard-item">
        <div class="card-num">Card #${idx + 1}</div>
        <div class="card-front">
          <span class="label">Question / Term:</span>
          <p>${escapeHtml(c.front)}</p>
        </div>
        <div class="card-back">
          <span class="label">Answer:</span>
          <p>${escapeHtml(c.back)}</p>
        </div>
        ${c.extraNote ? `<div class="card-note"><em>Note:</em> ${escapeHtml(c.extraNote)}</div>` : ''}
      </div>
    `)
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(deck.title)} - Nanki Flashcards</title>
      <style>
        @page {
          size: A4;
          margin: 1.5cm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #1a1a1a;
          margin: 0;
          padding: 20px;
          background: #fff;
        }
        .header {
          border-bottom: 2px solid #2563eb;
          padding-bottom: 12px;
          margin-bottom: 20px;
        }
        .title {
          font-size: 22px;
          font-weight: bold;
          margin: 4px 0;
        }
        .meta {
          font-size: 12px;
          color: #64748b;
        }
        .cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .flashcard-item {
          page-break-inside: avoid;
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
          padding: 14px;
          background: #fafafa;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .card-num {
          font-size: 10px;
          font-weight: bold;
          color: #2563eb;
          text-transform: uppercase;
        }
        .label {
          font-size: 10px;
          text-transform: uppercase;
          color: #64748b;
          font-weight: bold;
        }
        .card-front {
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 600;
        }
        .card-front p, .card-back p {
          margin: 2px 0 0;
        }
        .card-back {
          font-size: 12px;
          color: #334155;
          border-top: 1px solid #e2e8f0;
          padding-top: 6px;
        }
        .card-note {
          font-size: 11px;
          color: #64748b;
          margin-top: 6px;
        }
        .print-bar {
          background: #0f172a;
          color: #fff;
          padding: 12px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .btn-print {
          background: #2563eb;
          color: #fff;
          border: none;
          padding: 8px 18px;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
        }
        @media print {
          .no-print { display: none !important; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="print-bar no-print">
        <span>Flashcards Print Preview &bull; ${escapeHtml(deck.title)}</span>
        <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
      </div>

      <div class="header">
        <div style="font-size: 12px; font-weight: bold; color: #2563eb; text-transform: uppercase;">Nanki Flashcards</div>
        <h1 class="title">${escapeHtml(deck.title)}</h1>
        <div class="meta">Category: ${escapeHtml(deck.category)} &bull; ${deck.cards.length} Cards</div>
      </div>

      <div class="cards-grid">
        ${cardsHtml}
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
