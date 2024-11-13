// Selecteer de meest voorkomende advertenties op basis van klassen en id's
const adSelectors = [
    'iframe',  // Veel advertenties worden in iframes geladen
    'div[id*="ad"]',  // Elementen waarvan de ID "ad" bevat
    'div[class*="ad"]',  // Elementen waarvan de klasse "ad" bevat
    'img[src*="ad"]',  // Afbeeldingen waarvan de bron "ad" bevat
    '.adsbygoogle',  // Google Ads
    'div[class*="sponsor"]',  // Gesponsorde inhoud
    '.ad-container',  // Advertentie-container
    '.ad-banner',  // Advertentiebanners
  ];

  console.log("test");
  
  // Functie om advertenties te verwijderen
  function removeAds() {
    console.log("running");
    adSelectors.forEach(selector => {
      const ads = document.querySelectorAll(selector);
      ads.forEach(ad => ad.remove());  // Verwijder elk geselecteerd advertentie-element
    });
  }
  
  // Verwijder advertenties wanneer de pagina is geladen
  window.addEventListener('load', () => {
    removeAds();
  });
  
  // Blijf advertenties verwijderen bij veranderingen in de DOM
  const observer = new MutationObserver(removeAds);
  observer.observe(document.body, { childList: true, subtree: true });
  