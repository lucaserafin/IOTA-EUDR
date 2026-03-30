const loadingSection = document.getElementById('loading-section');
const emptySection = document.getElementById('empty-section');
const listSection = document.getElementById('list-section');
const countLabel = document.getElementById('count-label');
const notarizationList = document.getElementById('notarization-list');

async function loadHistory() {
  try {
    const response = await fetch('/api/notarizations');
    const data = await response.json();

    loadingSection.classList.add('hidden');

    if (data.count === 0) {
      emptySection.classList.remove('hidden');
      return;
    }

    countLabel.textContent = `${data.count} notarization${data.count > 1 ? 's' : ''}`;

    notarizationList.innerHTML = data.notarizations
      .map((n) => `
        <div class="history-card">
          <div class="history-header">
            <span class="history-parcel">${n.description || 'Notarization'}</span>
            <span class="history-commodity">${n.method}</span>
          </div>
          <div class="history-details">
            <div class="detail-row">
              <span class="label">Notarization ID:</span>
              <span class="mono">${n.notarization_id}</span>
            </div>
            <div class="detail-row">
              <span class="label">Claim Hash:</span>
              <span class="mono">${n.claim_hash}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span>${n.timestamp ? new Date(n.timestamp).toLocaleString() : 'N/A'}</span>
            </div>
          </div>
          <div class="history-actions">
            <a href="/verify?id=${n.notarization_id}" class="btn-small">Verify</a>
            <a href="${n.explorer_url}" target="_blank" class="btn-small secondary">Explorer</a>
          </div>
        </div>
      `)
      .join('');

    listSection.classList.remove('hidden');
  } catch (error) {
    loadingSection.innerHTML = '<p style="color: #dc3545;">Failed to load history.</p>';
  }
}

loadHistory();
