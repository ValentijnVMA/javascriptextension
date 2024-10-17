document.getElementById('toggleButton').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: toggleAds,
      });
    });
  });
  
  function toggleAds() {
    const ads = document.querySelectorAll('div, iframe, img');
    ads.forEach(ad => {
      if (ad.style.display === 'none') {
        ad.style.display = '';
      } else {
        ad.style.display = 'none';
      }
    });
  }
  