const form = document.getElementById('notarize-form');
const formSection = document.getElementById('form-section');
const loadingSection = document.getElementById('loading-section');
const resultSection = document.getElementById('result-section');

let lastResult = null;

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    parcel_id: document.getElementById('parcel_id').value,
    coordinates: {
      latitude: parseFloat(document.getElementById('latitude').value),
      longitude: parseFloat(document.getElementById('longitude').value),
    },
    commodity: document.getElementById('commodity').value,
    area_hectares: parseFloat(document.getElementById('area_hectares').value),
    assessment_date: document.getElementById('assessment_date').value,
  };

  formSection.classList.add('hidden');
  loadingSection.classList.remove('hidden');

  try {
    const response = await fetch('/api/notarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      lastResult = { ...result, ...data };
      showResult(result, data);
    } else {
      alert('Error: ' + result.error);
      formSection.classList.remove('hidden');
    }
  } catch (error) {
    alert('Network error. Please try again.');
    formSection.classList.remove('hidden');
  }

  loadingSection.classList.add('hidden');
});

function showResult(result, data) {
  document.getElementById('result-parcel').textContent = data.parcel_id;
  document.getElementById('result-commodity').textContent = data.commodity;
  document.getElementById('result-hash').textContent = result.claim_hash;
  document.getElementById('result-notarizationid').textContent = result.notarization_id;
  document.getElementById('result-timestamp').textContent = result.timestamp;
  document.getElementById('result-qr').src = result.qr_code;
  document.getElementById('explorer-link').href = result.explorer_url;

  resultSection.classList.remove('hidden');
}

function copyLink() {
  if (lastResult) {
    navigator.clipboard.writeText(lastResult.verification_url);
    alert('Verification link copied!');
  }
}

function resetForm() {
  form.reset();
  resultSection.classList.add('hidden');
  formSection.classList.remove('hidden');
  lastResult = null;
}
