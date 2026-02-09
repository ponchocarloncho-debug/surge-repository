// Widget.js - Generates video cards widget for all pages

// ========================================
// CONFIGURATION - Edit these values to customize the widget
// ========================================
const WIDGET_CONFIG = {
  // How many random videos to show (set to 0 to hide random section)
  randomVideosCount: 12,
  
  // How many recent videos to show (set to 0 to hide recent section)
  recentVideosCount: 4,
  
  // Show only random videos in individual pages (true/false)
  individualPagesOnlyRandom: false,
  
  // Show only recent videos in individual pages (true/false)
  individualPagesOnlyRecent: false,
  
  // Prioritize videos with same tags in individual pages (true/false)
  prioritizeSameTags: false,
  
  // Order: 'random-first' or 'recent-first'
  sectionOrder: 'random-first'
};
// ========================================

// Add CSS for bookmark styling
(function() {
  const style = document.createElement('style');
  style.textContent = `
    .favorite-btn {
      color: #666;
      transition: all 0.3s;
    }
    .favorite-btn.favorited {
      color: #e50914;
    }
    .favorite-btn:hover {
      transform: scale(1.2);
    }
    
    /* Toast notification */
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      max-width: 350px;
    }
    
    .toast.removing {
      animation: slideOut 0.3s ease-out;
    }
    
    .toast.added {
      border-left: 4px solid #22c55e;
    }
    
    .toast.removed {
      border-left: 4px solid #ef4444;
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
})();

(function() {
  let videosData = [];
  
  // Load videos from JSON
  async function loadVideos() {
    try {
      // Determine the correct path based on current location
      const currentPath = window.location.pathname;
      const isInVideosFolder = currentPath.includes('/videos/');
      const jsonPath = isInVideosFolder ? '../videos.json' : 'videos.json';
      
      const response = await fetch(jsonPath);
      if (!response.ok) {
        console.warn('videos.json not available - this is normal in preview mode');
        document.getElementById('video-widget').innerHTML = '<p style="color: #888; text-align: center; padding: 2rem;">Upload videos.json to see content</p>';
        return;
      }
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn('videos.json not found - upload the file to your server');
        document.getElementById('video-widget').innerHTML = '<p style="color: #888; text-align: center; padding: 2rem;">Upload videos.json to see content</p>';
        return;
      }
      videosData = await response.json();
      window.videosData = videosData; // Store globally for loadMoreRecent
      generateWidget();
    } catch (error) {
      console.warn('videos.json not available - this is normal in preview mode');
      const widgetEl = document.getElementById('video-widget');
      if (widgetEl) {
        widgetEl.innerHTML = '<p style="color: #888; text-align: center; padding: 2rem;">Upload videos.json to see content</p>';
      }
    }
  }
  
  // Get random image from images array
  function getRandomImage(images) {
    if (!images || images.length === 0) return '';
    return images[Math.floor(Math.random() * images.length)];
  }
  
  // Get random videos (excluding current page if applicable)
  function getRandomVideos(count) {
    // Get current page URL - normalize to match JSON format
    const pathParts = window.location.pathname.split('/');
    const filename = pathParts.pop();
    const folder = pathParts.pop();
    
    // Build current URL to match JSON format (e.g., "videos/filename.html")
    const currentUrl = folder && folder !== '' ? folder + '/' + filename : filename;
    
    let availableVideos = videosData.filter(v => v.url !== currentUrl);
    
    // If prioritizing same tags and we're on an individual page
    if (WIDGET_CONFIG.prioritizeSameTags && currentUrl.endsWith('.html') && currentUrl !== 'index.html') {
      const currentVideo = videosData.find(v => v.url === currentUrl);
      if (currentVideo && currentVideo.tags) {
        // Sort by number of matching tags
        availableVideos = availableVideos.sort((a, b) => {
          const aMatches = a.tags.filter(tag => currentVideo.tags.includes(tag)).length;
          const bMatches = b.tags.filter(tag => currentVideo.tags.includes(tag)).length;
          return bMatches - aMatches;
        });
      }
    }
    
    const shuffled = [...availableVideos].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count || WIDGET_CONFIG.randomVideosCount);
  }
  
  // Get recent videos
  function getRecentVideos(count) {
    // Get current page URL - normalize to match JSON format
    const pathParts = window.location.pathname.split('/');
    const filename = pathParts.pop();
    const folder = pathParts.pop();
    const currentUrl = folder && folder !== '' ? folder + '/' + filename : filename;
    
    return videosData
      .filter(v => v.url !== currentUrl)
      .slice(-(count || WIDGET_CONFIG.recentVideosCount))
      .reverse();
  }
  
  // Toggle favorite
  function toggleFavorite(button, event) {
    event.preventDefault();
    event.stopPropagation();
    
    const videoUrl = button.dataset.videoUrl;
    const videoTitle = button.dataset.videoTitle;
    
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.indexOf(videoUrl);
    
    if (index > -1) {
      favorites.splice(index, 1);
      button.innerHTML = '☆';
      button.classList.remove('favorited');
      showToast(`"${videoTitle}" removed from favorites`, 'removed');
    } else {
      favorites.push(videoUrl);
      button.innerHTML = '★';
      button.classList.add('favorited');
      showToast(`"${videoTitle}" added to favorites`, 'added');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
  
  // Show toast notification
  function showToast(message, type) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${type === 'added' ? '✓' : '✕'}</span>
      <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
  
  // Check if video is favorited
  function isFavorited(videoUrl) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return favorites.includes(videoUrl);
  }
  
  // Create video card HTML
  function createVideoCard(video) {
    const randomImage = getRandomImage(video.images);
    const favorited = isFavorited(video.url);
    
    // Determine correct URL path based on current location
    const currentPath = window.location.pathname;
    const isInVideosFolder = currentPath.includes('/videos/');
    
    // If we're in videos/ folder and URL starts with videos/, remove the prefix
    let videoUrl = video.url;
    if (isInVideosFolder && videoUrl.startsWith('videos/')) {
      videoUrl = videoUrl.replace('videos/', '');
    } else if (!isInVideosFolder && !videoUrl.startsWith('videos/') && videoUrl.endsWith('.html') && videoUrl !== 'index.html' && videoUrl !== 'favorites.html') {
      // If we're in root and URL doesn't have videos/ but it's a video page, add it
      videoUrl = 'videos/' + videoUrl;
    }
    
    return `
      <div class="video-card">
        <a href="${videoUrl}" class="video-link">
          <div class="video-thumbnail">
            <img src="${randomImage || video.thumbnail}" alt="${video.title}" loading="lazy">
          </div>
          <div class="video-info">
            <h3 class="video-title">${video.title}</h3>
          </div>
        </a>
        <button class="favorite-btn ${favorited ? 'favorited' : ''}" 
                data-video-url="${video.url}"
                data-video-title="${video.title.replace(/"/g, '&quot;')}"
                onclick="window.toggleFavorite(this, event)" 
                title="${favorited ? 'Remove from favorites' : 'Add to favorites'}">
          ${favorited ? '★' : '☆'}
        </button>
      </div>
    `;
  }
  
  // Generate widget HTML
  function generateWidget() {
    const widgetContainer = document.getElementById('video-widget');
    if (!widgetContainer) return;
    
    // Check if we have enough videos
    if (videosData.length === 0) {
      widgetContainer.innerHTML = '<p style="color: #888; text-align: center; padding: 2rem;">No videos available</p>';
      return;
    }
    
    const currentUrl = window.location.pathname.split('/').pop();
    const isIndividualPage = currentUrl.endsWith('.html') && currentUrl !== 'index.html';
    
    // Determine what to show based on config
    let showRandom = WIDGET_CONFIG.randomVideosCount > 0;
    let showRecent = WIDGET_CONFIG.recentVideosCount > 0;
    
    if (isIndividualPage) {
      if (WIDGET_CONFIG.individualPagesOnlyRandom) {
        showRecent = false;
      }
      if (WIDGET_CONFIG.individualPagesOnlyRecent) {
        showRandom = false;
      }
    }
    
    const randomVideos = showRandom ? getRandomVideos() : [];
    const recentVideos = showRecent ? getRecentVideos() : [];
    
    // If we only have one video (the current one), show a message
    if (randomVideos.length === 0 && recentVideos.length === 0) {
      widgetContainer.innerHTML = '<p style="color: #888; text-align: center; padding: 2rem;">Add more videos to see recommendations</p>';
      return;
    }
    
    let widgetHTML = '';
    
    // Determine order
    const sections = [];
    if (showRandom && randomVideos.length > 0) {
      sections.push({
        type: 'random',
        html: `
          <div class="widget-section">
            <h2 class="widget-title" style="display: flex; align-items: center; justify-content: space-between;">
              <span>Random Videos</span>
              <button onclick="location.reload()" style="
                background: #e50914;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.85rem;
                font-weight: bold;
                transition: background 0.3s;
              " onmouseover="this.style.background='#c40812'" onmouseout="this.style.background='#e50914'">
                🔄 Reload
              </button>
            </h2>
            <div class="widget-grid">
              ${randomVideos.map(video => createVideoCard(video)).join('')}
            </div>
          </div>
        `
      });
    }
    
    if (showRecent && recentVideos.length > 0) {
      sections.push({
        type: 'recent',
        html: `
          <div class="widget-section">
            <h2 class="widget-title">Recent Videos</h2>
            <div class="widget-grid" id="recent-videos-grid">
              ${recentVideos.map(video => createVideoCard(video)).join('')}
            </div>
            ${videosData.length > recentVideos.length ? `
              <button id="load-more-recent" onclick="loadMoreRecent()" style="
                width: 100%;
                background: #2a2a2a;
                color: white;
                border: 1px solid #3a3a3a;
                padding: 0.75rem;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.9rem;
                margin-top: 1rem;
                transition: all 0.3s;
              " onmouseover="this.style.background='#3a3a3a'" onmouseout="this.style.background='#2a2a2a'">
                Load 4 More Recent Videos ▼
              </button>
            ` : ''}
          </div>
        `
      });
    }
    
    // Apply order
    if (WIDGET_CONFIG.sectionOrder === 'recent-first') {
      sections.reverse();
    }
    
    widgetHTML = sections.map(s => s.html).join('');
    widgetContainer.innerHTML = widgetHTML;
  }
  
  // Make toggleFavorite available globally
  window.toggleFavorite = toggleFavorite;
  
  // Load more recent videos
  let currentRecentCount = WIDGET_CONFIG.recentVideosCount;
  window.loadMoreRecent = function() {
    currentRecentCount += 4;
    const grid = document.getElementById('recent-videos-grid');
    const button = document.getElementById('load-more-recent');
    
    const videosData = window.videosData || [];
    
    // Get current page URL
    const pathParts = window.location.pathname.split('/');
    const filename = pathParts.pop();
    const folder = pathParts.pop();
    const currentUrl = folder && folder !== '' ? folder + '/' + filename : filename;
    
    // Get all recent videos excluding current page
    const allRecent = videosData
      .filter(v => v.url !== currentUrl)
      .slice(-currentRecentCount)
      .reverse();
    
    grid.innerHTML = allRecent.map(video => createVideoCard(video)).join('');
    
    // Calculate total available recent videos
    const totalAvailable = videosData.filter(v => v.url !== currentUrl).length;
    
    // Hide button if showing all or no more to load
    if (currentRecentCount >= totalAvailable) {
      button.style.display = 'none';
    } else {
      const remaining = totalAvailable - currentRecentCount;
      button.textContent = `Load ${Math.min(4, remaining)} More Recent Videos ▼`;
    }
  };
  
  // Custom context menu for widget thumbnails
  let contextMenuTarget = null;
  
  document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'IMG' && e.target.closest('.video-card')) {
      e.preventDefault();
      
      const videoCard = e.target.closest('.video-card');
      const videoLink = videoCard?.querySelector('.video-link');
      let href = videoLink?.getAttribute('href');
      
      if (!href) return;
      
      // NORMALIZAR
      const currentPath = window.location.pathname;
      const isInVideosFolder = currentPath.includes('/videos/');
      
      if (!href.startsWith('http') && !href.startsWith('/')) {
        if (!isInVideosFolder && !href.startsWith('videos/') && href.endsWith('.html')) {
          href = 'videos/' + href;
        }
      }
      
      // Crear URL absoluta
      let fullUrl;
      if (href.startsWith('http')) {
        fullUrl = href;
      } else if (href.startsWith('/')) {
        fullUrl = window.location.origin + href;
      } else {
        if (isInVideosFolder && !href.startsWith('videos/')) {
          fullUrl = window.location.origin + '/videos/' + href;
        } else {
          fullUrl = window.location.origin + '/' + href;
        }
      }
      
      const existingMenu = document.getElementById('widget-context-menu');
      if (existingMenu) existingMenu.remove();
      
      const menu = document.createElement('div');
      menu.id = 'widget-context-menu';
      menu.style.cssText = `
        position: fixed;
        top: ${e.clientY}px;
        left: ${e.clientX}px;
        background: #1a1a1a;
        border: 1px solid #2a2a2a;
        border-radius: 4px;
        padding: 0.5rem 0;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      `;
      
      const copyLink = document.createElement('div');
      copyLink.textContent = 'Copy link...';
      copyLink.style.cssText = `
        padding: 0.5rem 1rem;
        cursor: pointer;
        color: #e0e0e0;
        font-size: 0.9rem;
      `;
      copyLink.onmouseover = () => copyLink.style.background = '#2a2a2a';
      copyLink.onmouseout = () => copyLink.style.background = 'transparent';
      copyLink.onclick = () => {
        navigator.clipboard.writeText(fullUrl).then(() => {
          // Link copied silently
        }).catch(console.error);
        menu.remove();
      };
      
      menu.appendChild(copyLink);
      document.body.appendChild(menu);
      
      setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
          if (menu && menu.parentNode) menu.remove();
          document.removeEventListener('click', closeMenu);
        });
      }, 100);
      
      return false;
    }
  });
  
  // Remove custom menu on click elsewhere
  document.addEventListener('click', function() {
    if (contextMenuTarget) {
      contextMenuTarget.remove();
      contextMenuTarget = null;
    }
  });
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadVideos);
  } else {
    loadVideos();
  }
})();
