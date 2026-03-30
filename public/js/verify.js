const form = document.getElementById('verify-form');
const searchSection = document.getElementById('search-section');
const loadingSection = document.getElementById('loading-section');
const resultSection = document.getElementById('result-section');
const resultCard = document.getElementById('result-card');

// Check URL params for notarization ID
const urlParams = new URLSearchParams(window.location.search);
const idParam = urlParams.get('id');
if (idParam) {
  document.getElementById('notarizationId').value = idParam;
  verifyNotarization(idParam);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const notarizationId = document.getElementById('notarizationId').value.trim();
  verifyNotarization(notarizationId);
});

async function verifyNotarization(notarizationId) {
  searchSection.classList.add('hidden');
  loadingSection.classList.remove('hidden');
  resultSection.classList.add('hidden');

  try {
    const response = await fetch(`/api/verify/${encodeURIComponent(notarizationId)}`);
    const result = await response.json();
    showResult(result);
  } catch (error) {
    showResult({ found: false, error: 'Network error' });
  }

  loadingSection.classList.add('hidden');
}

function showResult(result) {
  if (result.found) {
    resultCard.className = 'success-card verified';
    resultCard.innerHTML = `
      <h2>Verified on IOTA</h2>
      <div class="result-details">
        <div class="detail-row">
          <span class="label">Status:</span>
          <span>Confirmed on IOTA Rebased</span>
        </div>
        <div class="detail-row">
          <span class="label">Notarization ID:</span>
          <span class="mono">${result.notarization_id}</span>
        </div>
        <div class="detail-row">
          <span class="label">Claim Hash:</span>
          <span class="mono">${result.claim_hash || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="label">Description:</span>
          <span>${result.description || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="label">Timestamp:</span>
          <span>${result.timestamp || 'N/A'}</span>
        </div>
      </div>
      <a href="${result.explorer_url}" target="_blank" class="btn">View on IOTA Explorer</a>
      <p style="margin-top: 1rem; color: #666; font-size: 0.9rem;">
        Note: This verifies the claim EXISTS on IOTA. It does NOT verify the claim is TRUE.
      </p>
    `;
  } else {
    resultCard.className = 'success-card not-found';
    resultCard.innerHTML = `
      <h2 style="color: #dc3545;">Not Found</h2>
      <p>${result.error || 'Notarization not found on IOTA'}</p>
      <button onclick="tryAgain()" style="margin-top: 1rem;">Try Another</button>
    `;
  }

  resultSection.classList.remove('hidden');
}

function tryAgain() {
  resultSection.classList.add('hidden');
  searchSection.classList.remove('hidden');
  document.getElementById('notarizationId').value = '';
}
