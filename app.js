(() => {
  'use strict';

  const STORAGE_KEY = 'hanevuchim_state_v1';
  const AVATAR_COLORS = [
    '#1E2A3A', '#9A6B2F', '#2C6B4F', '#5C4B51',
    '#4A5568', '#7C4D3A', '#3B526B', '#6B5B3E'
  ];

  // Initial philosophical community seed data
  function createSeedState() {
    const now = Date.now();
    const min = 60 * 1000;
    const hour = 60 * min;

    return {
      currentUserId: null,
      users: [
        {
          id: 'u_admin',
          username: 'admin',
          displayName: 'מנהל הסלון',
          password: '1234',
          role: 'admin',
          status: 'active',
          avatarColor: '#1E2A3A',
          createdAt: now - 48 * hour
        },
        {
          id: 'u_daniel',
          username: 'daniel',
          displayName: 'דניאל המהרהר',
          password: '1234',
          role: 'user',
          status: 'active',
          avatarColor: '#9A6B2F',
          createdAt: now - 36 * hour
        },
        {
          id: 'u_noa',
          username: 'noa',
          displayName: 'נועה הספקנית',
          password: '1234',
          role: 'user',
          status: 'active',
          avatarColor: '#3B526B',
          createdAt: now - 24 * hour
        },
        {
          id: 'u_yossi',
          username: 'yossi',
          displayName: 'יוסי הסטואי',
          password: '1234',
          role: 'user',
          status: 'active',
          avatarColor: '#2C6B4F',
          createdAt: now - 12 * hour
        }
      ],
      posts: [
        {
          id: 'p_1',
          authorId: 'u_daniel',
          title: 'האם הספק הוא סימן לחולשה או לחופש מחשבה?',
          body: 'בעולם שמעודד תשובות נחרצות ומהירות, דווקא השהייה והמבוכה מול שאלה מורכבת נראות לי כביטוי העמוק ביותר לאנושיות. מי שלא נבוך לעולם — אולי פשוט הפסיק להקשיב למציאות המשתנה.',
          category: 'פילוסופיה ומחשבה',
          imageData: null,
          likes: ['u_noa', 'u_yossi', 'u_admin'],
          comments: [
            {
              id: 'c_1',
              authorId: 'u_noa',
              text: 'מסכימה לגמרי. סוקרטס הבין שהידיעה שאינך יודע היא תנאי מוקדם לכל חקירה אמיתית.',
              createdAt: now - 2 * hour
            }
          ],
          createdAt: now - 5 * hour,
          updatedAt: null
        },
        {
          id: 'p_2',
          authorId: 'u_noa',
          title: 'פרדוקס הספינה של תסאוס בעידן הבינה המלאכותית',
          body: 'אם אנחנו מחליפים בהדרגה חלקים מהזיכרון, מהכתיבה ומההחלטות היומיומיות שלנו בכלים חיצוניים — באיזו נקודה המחשבה מפסיקה להיות "שלנו", או שמא התודעה תמיד הייתה שיתוף פעולה עם כלים?',
          category: 'טכנולוגיה ותודעה',
          imageData: null,
          likes: ['u_daniel', 'u_yossi'],
          comments: [
            {
              id: 'c_2',
              authorId: 'u_yossi',
              text: 'כבר אפלטון חשש שהכתב יחליש את הזיכרון האנושי. האתגר הוא לשמור על כושר השיפוט העצמאי.',
              createdAt: now - 40 * min
            }
          ],
          createdAt: now - 3 * hour,
          updatedAt: null
        },
        {
          id: 'p_3',
          authorId: 'u_yossi',
          title: 'על ההבחנה הסטואית בין מה שבשליטתנו למה שלא',
          body: 'אפיקטטוס טען שמקור רוב הסבל האנושי הוא הניסיון לשלוט בתוצאות חיצוניות במקום בגישה הפנימית שלנו. האם לדעתכם השקפה כזו מחזקת את האחריות המוסרית או עלולה להוביל לאדישות חברתית?',
          category: 'דילמות מוסריות',
          imageData: null,
          likes: ['u_daniel'],
          comments: [],
          createdAt: now - 45 * min,
          updatedAt: null
        }
      ]
    };
  }

  let state = loadState();
  let uiState = {
    category: 'הכל',
    sort: 'newest',
    search: '',
    expandedComments: new Set(),
    pendingImageData: null
  };

  let pendingConfirmCallback = null;

  // DOM References
  const headerActionsEl = document.getElementById('headerActions');
  const searchInputEl = document.getElementById('searchInput');
  const brandResetLinkEl = document.getElementById('brandResetLink');
  const composerSectionEl = document.getElementById('composerSection');
  const categoryChipsEl = document.getElementById('categoryChips');
  const sortSelectEl = document.getElementById('sortSelect');
  const postsFeedEl = document.getElementById('postsFeed');
  const sidebarStatsEl = document.getElementById('sidebarStats');
  const sidebarUserCardEl = document.getElementById('sidebarUserCard');
  const communityMembersListEl = document.getElementById('communityMembersList');

  // Auth Modal Refs
  const authModalEl = document.getElementById('authModal');
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginErrorEl = document.getElementById('loginError');
  const registerErrorEl = document.getElementById('registerError');
  const quickAdminBtn = document.getElementById('quickAdminBtn');
  const quickUserBtn = document.getElementById('quickUserBtn');

  // Edit Post Modal Refs
  const editPostModalEl = document.getElementById('editPostModal');
  const editPostForm = document.getElementById('editPostForm');
  const editPostIdEl = document.getElementById('editPostId');
  const editPostTitleEl = document.getElementById('editPostTitle');
  const editPostCategoryEl = document.getElementById('editPostCategory');
  const editPostBodyEl = document.getElementById('editPostBody');

  // Admin Modal Refs
  const adminModalEl = document.getElementById('adminModal');
  const adminSummaryEl = document.getElementById('adminSummary');
  const adminAddUserForm = document.getElementById('adminAddUserForm');
  const adminAddUserErrorEl = document.getElementById('adminAddUserError');
  const adminUsersListEl = document.getElementById('adminUsersList');
  const resetDemoDataBtn = document.getElementById('resetDemoDataBtn');

  // Confirm Modal Refs
  const confirmModalEl = document.getElementById('confirmModal');
  const confirmModalTitleEl = document.getElementById('confirmModalTitle');
  const confirmModalMessageEl = document.getElementById('confirmModalMessage');
  const confirmExtraOptionEl = document.getElementById('confirmExtraOption');
  const confirmExtraCheckboxEl = document.getElementById('confirmExtraCheckbox');
  const confirmExtraLabelEl = document.getElementById('confirmExtraLabel');
  const confirmActionBtn = document.getElementById('confirmActionBtn');

  const toastContainerEl = document.getElementById('toastContainer');

  // State Helpers
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seed = createSeedState();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
        return seed;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.users) || !Array.isArray(parsed.posts)) {
        return createSeedState();
      }
      return parsed;
    } catch (e) {
      return createSeedState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      showToast('האחסון המקומי בדפדפן מלא. נסו למחוק פוסט או להעלות תמונה קטנה יותר.', 'error');
      return false;
    }
  }

  function getCurrentUser() {
    if (!state.currentUserId) return null;
    const user = state.users.find(u => u.id === state.currentUserId);
    if (!user || user.status === 'banned') {
      state.currentUserId = null;
      return null;
    }
    return user;
  }

  function getUserById(userId) {
    return state.users.find(u => u.id === userId) || null;
  }

  function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getInitial(name) {
    const clean = String(name || '?').trim();
    return clean ? clean.charAt(0) : '?';
  }

  function formatRelativeTime(timestamp) {
    const diff = Date.now() - timestamp;
    const sec = Math.floor(diff / 1000);
    if (sec < 45) return 'לפני רגע';
    const min = Math.floor(sec / 60);
    if (min < 60) return `לפני ${min} דק׳`;
    const hours = Math.floor(min / 60);
    if (hours < 24) return `לפני ${hours} שע׳`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `לפני ${days} ימים`;
    return new Date(timestamp).toLocaleDateString('he-IL');
  }

  function pickAvatarColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  function showToast(message, type = 'default') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : ''}`;
    toast.textContent = message;
    toastContainerEl.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3400);
  }

  // Image Compression via Canvas for safe localStorage storage
  function compressImageFile(file) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('נא לבחור קובץ תמונה תקין'));
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('שגיאה בקריאת הקובץ'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('לא ניתן לטעון את התמונה'));
        img.onload = () => {
          const maxWidth = 800;
          const scale = img.width > maxWidth ? maxWidth / img.width : 1;
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.76));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Modal Management
  function openModal(modalEl) {
    modalEl.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modalEl) {
    modalEl.hidden = true;
    const anyOpen = [authModalEl, editPostModalEl, adminModalEl, confirmModalEl].some(m => !m.hidden);
    if (!anyOpen) {
      document.body.style.overflow = '';
    }
  }

  function switchAuthTab(tab) {
    loginErrorEl.hidden = true;
    registerErrorEl.hidden = true;
    if (tab === 'login') {
      tabLoginBtn.classList.add('active');
      tabRegisterBtn.classList.remove('active');
      loginForm.hidden = false;
      registerForm.hidden = true;
    } else {
      tabRegisterBtn.classList.add('active');
      tabLoginBtn.classList.remove('active');
      registerForm.hidden = false;
      loginForm.hidden = true;
    }
  }

  function openConfirmDialog({ title, message, confirmText = 'אישור', extraCheckboxLabel = null, onConfirm }) {
    confirmModalTitleEl.textContent = title;
    confirmModalMessageEl.textContent = message;
    confirmActionBtn.textContent = confirmText;

    if (extraCheckboxLabel) {
      confirmExtraOptionEl.hidden = false;
      confirmExtraCheckboxEl.checked = true;
      confirmExtraLabelEl.textContent = extraCheckboxLabel;
    } else {
      confirmExtraOptionEl.hidden = true;
    }

    pendingConfirmCallback = onConfirm;
    openModal(confirmModalEl);
  }

  // Rendering
  function renderAll() {
    renderHeader();
    renderComposer();
    renderPosts();
    renderSidebar();
    if (!adminModalEl.hidden) {
      renderAdminPanel();
    }
  }

  function renderHeader() {
    const user = getCurrentUser();
    if (!user) {
      headerActionsEl.innerHTML = `
        <button type="button" class="btn btn-outline btn-sm" id="openLoginBtn">התחברות</button>
        <button type="button" class="btn btn-primary btn-sm" id="openRegisterBtn">הצטרפות לסלון</button>
      `;
      document.getElementById('openLoginBtn').addEventListener('click', () => {
        switchAuthTab('login');
        openModal(authModalEl);
      });
      document.getElementById('openRegisterBtn').addEventListener('click', () => {
        switchAuthTab('register');
        openModal(authModalEl);
      });
    } else {
      const adminBtn = user.role === 'admin'
        ? `<button type="button" class="btn btn-secondary btn-sm" id="openAdminPanelBtn">פאנל ניהול</button>`
        : '';
      headerActionsEl.innerHTML = `
        <span class="user-pill">
          <span class="avatar avatar-sm" style="background:${escapeHtml(user.avatarColor)}">${escapeHtml(getInitial(user.displayName))}</span>
          <span>${escapeHtml(user.displayName)}</span>
          ${user.role === 'admin' ? '<span class="role-badge role-badge-admin">מנהל</span>' : ''}
        </span>
        ${adminBtn}
        <button type="button" class="btn btn-ghost btn-sm" id="logoutBtn">התנתק</button>
      `;
      if (user.role === 'admin') {
        document.getElementById('openAdminPanelBtn').addEventListener('click', () => {
          renderAdminPanel();
          openModal(adminModalEl);
        });
      }
      document.getElementById('logoutBtn').addEventListener('click', logoutUser);
    }
  }

  function renderComposer() {
    const user = getCurrentUser();
    if (!user) {
      composerSectionEl.innerHTML = `
        <div class="composer-guest">
          <div class="composer-guest-text">
            <h2>יש לך תהייה פילוסופית או שאלה שמעסיקה את המחשבה?</h2>
            <p>הצטרפו לסלון הנבוכים כדי לנסח רעיון, להעלות דילמה ולהתדיין עם הוגים אחרים.</p>
          </div>
          <div class="demo-buttons">
            <button type="button" class="btn btn-primary" id="guestPublishCta">התחברות / הצטרפות לכתיבה</button>
          </div>
        </div>
      `;
      document.getElementById('guestPublishCta').addEventListener('click', () => {
        switchAuthTab('register');
        openModal(authModalEl);
      });
      return;
    }

    composerSectionEl.innerHTML = `
      <form id="postComposerForm" class="composer-form">
        <div class="composer-header">
          <span class="avatar" style="background:${escapeHtml(user.avatarColor)}">${escapeHtml(getInitial(user.displayName))}</span>
          <div>
            <strong>${escapeHtml(user.displayName)}</strong>
            <div class="post-time">נסחו מחשבה, שאלה מוסרית או התבוננות פילוסופית</div>
          </div>
        </div>

        <div class="composer-row">
          <input type="text" id="postTitleInput" class="text-input" maxlength="90" placeholder="כותרת או תזה מרכזית (אופציונלי)">
          <select id="postCategorySelect" class="select-input" aria-label="תחום דעת">
            <option value="פילוסופיה ומחשבה">פילוסופיה ומחשבה</option>
            <option value="דילמות מוסריות">דילמות מוסריות</option>
            <option value="חברה ותרבות">חברה ותרבות</option>
            <option value="טכנולוגיה ותודעה">טכנולוגיה ותודעה</option>
            <option value="כללי">כללי</option>
          </select>
        </div>

        <textarea id="postBodyInput" class="textarea-input" rows="3" required maxlength="1500" placeholder="מה מעסיק את מחשבתך? שתפו את הטיעון או ההרהור כאן..."></textarea>

        <div id="composerPreviewContainer"></div>

        <div class="composer-footer">
          <label class="image-upload-label">
            <span>📜 צרף איור או מקור חזותי</span>
            <input type="file" id="postImageInput" accept="image/*" hidden>
          </label>
          <button type="submit" class="btn btn-primary">פרסם הגות</button>
        </div>
      </form>
    `;

    renderComposerPreview();

    const postImageInput = document.getElementById('postImageInput');
    postImageInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        uiState.pendingImageData = await compressImageFile(file);
        renderComposerPreview();
      } catch (err) {
        showToast(err.message || 'שגיאה בצירוף התמונה', 'error');
      }
      postImageInput.value = '';
    });

    const composerForm = document.getElementById('postComposerForm');
    composerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('postTitleInput').value.trim();
      const category = document.getElementById('postCategorySelect').value;
      const body = document.getElementById('postBodyInput').value.trim();

      if (!body) {
        showToast('נא לכתוב תוכן לפני הפרסום', 'error');
        return;
      }

      const newPost = {
        id: generateId('p'),
        authorId: user.id,
        title,
        body,
        category,
        imageData: uiState.pendingImageData,
        likes: [],
        comments: [],
        createdAt: Date.now(),
        updatedAt: null
      };

      state.posts.unshift(newPost);
      if (saveState()) {
        uiState.pendingImageData = null;
        uiState.category = 'הכל';
        updateCategoryChipUI();
        renderAll();
        showToast('הרשימה פורסמה בסלון בהצלחה', 'success');
      } else {
        state.posts.shift();
      }
    });
  }

  function renderComposerPreview() {
    const container = document.getElementById('composerPreviewContainer');
    if (!container) return;
    if (!uiState.pendingImageData) {
      container.innerHTML = '';
      return;
    }
    container.innerHTML = `
      <div class="composer-image-preview">
        <img src="${uiState.pendingImageData}" alt="תצוגה מקדימה לתמונה שתצורף לפוסט">
        <button type="button" class="remove-preview-btn" id="removeImagePreviewBtn" aria-label="הסר תמונה">✕</button>
      </div>
    `;
    document.getElementById('removeImagePreviewBtn').addEventListener('click', () => {
      uiState.pendingImageData = null;
      renderComposerPreview();
    });
  }

  function getFilteredPosts() {
    const q = uiState.search.trim().toLowerCase();
    let list = state.posts.filter(post => {
      if (uiState.category !== 'הכל' && post.category !== uiState.category) {
        return false;
      }
      if (!q) return true;
      const author = getUserById(post.authorId);
      const authorName = author ? author.displayName.toLowerCase() : '';
      return (
        (post.title && post.title.toLowerCase().includes(q)) ||
        post.body.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        authorName.includes(q)
      );
    });

    if (uiState.sort === 'likes') {
      list = [...list].sort((a, b) => b.likes.length - a.likes.length || b.createdAt - a.createdAt);
    } else if (uiState.sort === 'comments') {
      list = [...list].sort((a, b) => b.comments.length - a.comments.length || b.createdAt - a.createdAt);
    } else {
      list = [...list].sort((a, b) => b.createdAt - a.createdAt);
    }

    return list;
  }

  function renderPosts() {
    const currentUser = getCurrentUser();
    const isAdmin = currentUser && currentUser.role === 'admin';
    const posts = getFilteredPosts();

    if (posts.length === 0) {
      postsFeedEl.innerHTML = `
        <div class="card empty-state">
          <div class="empty-state-icon">🏛️</div>
          <h3>לא נמצאו הרהורים תואמים</h3>
          <p>אפשר לנקות את הסינון או לפתוח בדיון חדש בתחום הזה.</p>
          ${(uiState.category !== 'הכל' || uiState.search) ? '<button type="button" class="btn btn-outline" id="clearFiltersBtn">נקה סינון וחיפוש</button>' : ''}
        </div>
      `;
      const clearBtn = document.getElementById('clearFiltersBtn');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          uiState.category = 'הכל';
          uiState.search = '';
          searchInputEl.value = '';
          updateCategoryChipUI();
          renderPosts();
        });
      }
      return;
    }

    postsFeedEl.innerHTML = posts.map(post => {
      const author = getUserById(post.authorId);
      const authorName = author ? author.displayName : 'חבר שהוסר';
      const avatarColor = author ? author.avatarColor : '#8A93A5';
      const isAuthorBanned = author && author.status === 'banned';
      const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
      const canEdit = currentUser && currentUser.id === post.authorId;
      const canDelete = currentUser && (currentUser.id === post.authorId || isAdmin);
      const canKickAuthor = isAdmin && author && author.id !== currentUser.id && author.role !== 'admin' && author.status !== 'banned';
      const commentsOpen = uiState.expandedComments.has(post.id);

      const commentsHtml = commentsOpen ? renderCommentsSection(post, currentUser, isAdmin) : '';

      return `
        <article class="card post-card" data-post-id="${escapeHtml(post.id)}">
          <div class="post-header">
            <div class="post-author">
              <span class="avatar" style="background:${escapeHtml(avatarColor)}">${escapeHtml(getInitial(authorName))}</span>
              <div class="post-author-meta">
                <div class="post-author-name-row">
                  <span class="post-author-name">${escapeHtml(authorName)}</span>
                  ${author && author.role === 'admin' ? '<span class="role-badge role-badge-admin">מנהל</span>' : ''}
                  ${isAuthorBanned ? '<span class="role-badge role-badge-banned">הורחק</span>' : ''}
                </div>
                <span class="post-time">
                  ${escapeHtml(formatRelativeTime(post.createdAt))}
                  ${post.updatedAt ? ' · נערך' : ''}
                </span>
              </div>
            </div>
            <div class="post-header-right">
              <span class="category-pill">${escapeHtml(post.category)}</span>
            </div>
          </div>

          ${post.title ? `<h3 class="post-title">${escapeHtml(post.title)}</h3>` : ''}
          <p class="post-body">${escapeHtml(post.body)}</p>

          ${post.imageData ? `
            <div class="post-image-wrap">
              <img src="${post.imageData}" alt="תמונה שצורפה לפוסט" loading="lazy">
            </div>
          ` : ''}

          <div class="post-actions-bar">
            <div class="post-reactions">
              <button type="button" class="reaction-btn ${isLiked ? 'liked' : ''}" data-action="toggle-like" data-post-id="${escapeHtml(post.id)}">
                <span>✦</span>
                <span>מעורר מחשבה (${post.likes.length})</span>
              </button>
              <button type="button" class="reaction-btn" data-action="toggle-comments" data-post-id="${escapeHtml(post.id)}">
                <span>💬</span>
                <span>דיון (${post.comments.length})</span>
              </button>
            </div>

            <div class="post-manage-actions">
              ${canEdit ? `<button type="button" class="btn btn-ghost btn-sm" data-action="edit-post" data-post-id="${escapeHtml(post.id)}">ערוך</button>` : ''}
              ${canDelete ? `<button type="button" class="btn btn-danger-soft btn-sm" data-action="delete-post" data-post-id="${escapeHtml(post.id)}">מחק</button>` : ''}
              ${canKickAuthor ? `<button type="button" class="btn btn-danger-soft btn-sm" data-action="kick-user" data-user-id="${escapeHtml(author.id)}">העף משתמש</button>` : ''}
            </div>
          </div>

          ${commentsHtml}
        </article>
      `;
    }).join('');
  }

  function renderCommentsSection(post, currentUser, isAdmin) {
    const itemsHtml = post.comments.length
      ? post.comments.map(comment => {
          const cAuthor = getUserById(comment.authorId);
          const cName = cAuthor ? cAuthor.displayName : 'חבר שהוסר';
          const cColor = cAuthor ? cAuthor.avatarColor : '#8A93A5';
          const canDeleteComment = currentUser && (currentUser.id === comment.authorId || currentUser.id === post.authorId || isAdmin);
          return `
            <div class="comment-item">
              <div class="comment-main">
                <span class="avatar avatar-sm" style="background:${escapeHtml(cColor)}">${escapeHtml(getInitial(cName))}</span>
                <div class="comment-content">
                  <div class="comment-meta">
                    <span class="comment-author">${escapeHtml(cName)}</span>
                    ${cAuthor && cAuthor.role === 'admin' ? '<span class="role-badge role-badge-admin">מנהל</span>' : ''}
                    <span class="comment-time">${escapeHtml(formatRelativeTime(comment.createdAt))}</span>
                  </div>
                  <p class="comment-text">${escapeHtml(comment.text)}</p>
                </div>
              </div>
              ${canDeleteComment ? `<button type="button" class="icon-btn" title="מחק תגובה" aria-label="מחק תגובה" data-action="delete-comment" data-post-id="${escapeHtml(post.id)}" data-comment-id="${escapeHtml(comment.id)}">🗑</button>` : ''}
            </div>
          `;
        }).join('')
      : '<p class="empty-comments">טרם נכתבו תגובות — פתחו את הדיון!</p>';

    const formHtml = currentUser
      ? `
        <form class="comment-form" data-action="add-comment" data-post-id="${escapeHtml(post.id)}">
          <input type="text" class="text-input" name="commentText" required maxlength="400" placeholder="הוסיפו התייחסות או נימוק...">
          <button type="submit" class="btn btn-secondary btn-sm">שלח</button>
        </form>
      `
      : '<p class="empty-comments">התחברו כדי להשתתף בדיון.</p>';

    return `
      <div class="comments-section">
        ${itemsHtml}
        ${formHtml}
      </div>
    `;
  }

  function renderSidebar() {
    const activeUsers = state.users.filter(u => u.status === 'active');
    const totalComments = state.posts.reduce((sum, p) => sum + p.comments.length, 0);

    sidebarStatsEl.innerHTML = `
      <div class="stat-box">
        <span class="stat-value">${state.posts.length}</span>
        <span class="stat-label">רשימות</span>
      </div>
      <div class="stat-box">
        <span class="stat-value">${activeUsers.length}</span>
        <span class="stat-label">הוגים</span>
      </div>
      <div class="stat-box">
        <span class="stat-value">${totalComments}</span>
        <span class="stat-label">תגובות</span>
      </div>
    `;

    const currentUser = getCurrentUser();
    if (!currentUser) {
      sidebarUserCardEl.innerHTML = `
        <h3 class="sidebar-subheading">התנסות בסלון</h3>
        <p class="sidebar-desc">קוראים אורחים יכולים לעיין בדיונים. רוצים לפרסם הגות או לנסות את כלי הניהול?</p>
        <div class="stack-form">
          <button type="button" class="btn btn-secondary btn-sm btn-full" id="sidebarAdminLoginBtn">כניסה כמנהל (הוספה והרחקת חברים)</button>
          <button type="button" class="btn btn-outline btn-sm btn-full" id="sidebarRegisterBtn">צור פרופיל חדש</button>
        </div>
      `;
      document.getElementById('sidebarAdminLoginBtn').addEventListener('click', () => {
        loginByCredentials('admin', '1234');
      });
      document.getElementById('sidebarRegisterBtn').addEventListener('click', () => {
        switchAuthTab('register');
        openModal(authModalEl);
      });
    } else {
      sidebarUserCardEl.innerHTML = `
        <h3 class="sidebar-subheading">מחובר לסלון</h3>
        <div class="community-member-info" style="margin-bottom:12px;">
          <span class="avatar" style="background:${escapeHtml(currentUser.avatarColor)}">${escapeHtml(getInitial(currentUser.displayName))}</span>
          <div>
            <div><strong>${escapeHtml(currentUser.displayName)}</strong></div>
            <div class="post-time">@${escapeHtml(currentUser.username)} · ${currentUser.role === 'admin' ? 'מנהל הסלון' : 'חבר רשום'}</div>
          </div>
        </div>
        ${currentUser.role === 'admin'
          ? '<button type="button" class="btn btn-secondary btn-sm btn-full" id="sidebarOpenAdminBtn">פתח פאנל ניהול חברים</button>'
          : '<button type="button" class="btn btn-outline btn-sm btn-full" id="sidebarSwitchAccountBtn">החלף משתמש / הוסף חבר</button>'
        }
      `;
      if (currentUser.role === 'admin') {
        document.getElementById('sidebarOpenAdminBtn').addEventListener('click', () => {
          renderAdminPanel();
          openModal(adminModalEl);
        });
      } else {
        document.getElementById('sidebarSwitchAccountBtn').addEventListener('click', () => {
          switchAuthTab('register');
          openModal(authModalEl);
        });
      }
    }

    communityMembersListEl.innerHTML = activeUsers.map(u => {
      const postCount = state.posts.filter(p => p.authorId === u.id).length;
      return `
        <li class="community-member-item">
          <div class="community-member-info">
            <span class="avatar avatar-sm" style="background:${escapeHtml(u.avatarColor)}">${escapeHtml(getInitial(u.displayName))}</span>
            <span class="community-member-name">${escapeHtml(u.displayName)}</span>
            ${u.role === 'admin' ? '<span class="role-badge role-badge-admin">מנהל</span>' : ''}
          </div>
          <span class="post-time">${postCount} רשימות</span>
        </li>
      `;
    }).join('');
  }

  function renderAdminPanel() {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') return;

    const activeCount = state.users.filter(u => u.status === 'active').length;
    const bannedCount = state.users.filter(u => u.status === 'banned').length;

    adminSummaryEl.innerHTML = `
      <div class="stat-box">
        <span class="stat-value">${activeCount}</span>
        <span class="stat-label">חברים פעילים</span>
      </div>
      <div class="stat-box">
        <span class="stat-value">${bannedCount}</span>
        <span class="stat-label">חברים שהורחקו</span>
      </div>
      <div class="stat-box">
        <span class="stat-value">${state.posts.length}</span>
        <span class="stat-label">סה״כ רשימות</span>
      </div>
    `;

    adminUsersListEl.innerHTML = state.users.map(user => {
      const postCount = state.posts.filter(p => p.authorId === user.id).length;
      const isSelf = user.id === currentUser.id;
      const isBanned = user.status === 'banned';

      let actionButtons = '';
      if (isSelf) {
        actionButtons = '<span class="post-time">זה הפרופיל שלך</span>';
      } else {
        const kickOrRestoreBtn = isBanned
          ? `<button type="button" class="btn btn-outline btn-sm" data-admin-action="restore" data-user-id="${escapeHtml(user.id)}">שחזר גישה</button>`
          : `<button type="button" class="btn btn-danger-soft btn-sm" data-admin-action="kick" data-user-id="${escapeHtml(user.id)}">העף / חסום</button>`;
        const deletePermBtn = `<button type="button" class="btn btn-ghost btn-sm text-danger" data-admin-action="delete-user" data-user-id="${escapeHtml(user.id)}">מחק לצמיתות</button>`;
        actionButtons = kickOrRestoreBtn + deletePermBtn;
      }

      return `
        <div class="admin-user-row">
          <div class="admin-user-info">
            <span class="avatar" style="background:${escapeHtml(user.avatarColor)}">${escapeHtml(getInitial(user.displayName))}</span>
            <div class="admin-user-meta">
              <div class="post-author-name-row">
                <strong>${escapeHtml(user.displayName)}</strong>
                ${user.role === 'admin' ? '<span class="role-badge role-badge-admin">מנהל</span>' : ''}
                ${isBanned ? '<span class="role-badge role-badge-banned">הורחק מהאתר</span>' : ''}
              </div>
              <span class="admin-user-sub">@${escapeHtml(user.username)} · ${postCount} רשימות</span>
            </div>
          </div>
          <div class="admin-user-actions">
            ${actionButtons}
          </div>
        </div>
      `;
    }).join('');
  }

  // Auth & User Actions
  function loginByCredentials(username, password) {
    const cleanUsername = username.trim().toLowerCase();
    const user = state.users.find(u => u.username.toLowerCase() === cleanUsername);
    if (!user || user.password !== password) {
      return { ok: false, error: 'שם המשתמש או הסיסמה אינם נכונים.' };
    }
    if (user.status === 'banned') {
      return { ok: false, error: 'משתמש זה הורחק / נחסם מהאתר על ידי המנהל.' };
    }

    state.currentUserId = user.id;
    saveState();
    closeModal(authModalEl);
    renderAll();
    showToast(`ברוך הבא לסלון, ${user.displayName}`, 'success');
    return { ok: true };
  }

  function logoutUser() {
    state.currentUserId = null;
    uiState.pendingImageData = null;
    saveState();
    renderAll();
    showToast('התנתקת מהסלון');
  }

  function createUser({ displayName, username, password, role = 'user', autoLogin = false }) {
    const cleanDisplay = displayName.trim();
    const cleanUsername = username.trim().toLowerCase();

    if (cleanDisplay.length < 2) {
      return { ok: false, error: 'שם התצוגה חייב להכיל לפחות 2 תווים.' };
    }
    if (!/^[a-z0-9_.-]{3,24}$/i.test(cleanUsername)) {
      return { ok: false, error: 'שם המשתמש צריך להכיל 3–24 תווים (אותיות באנגלית, ספרות או _).' };
    }
    if (password.length < 3) {
      return { ok: false, error: 'הסיסמה חייבת להכיל לפחות 3 תווים.' };
    }
    if (state.users.some(u => u.username.toLowerCase() === cleanUsername)) {
      return { ok: false, error: 'שם המשתמש הזה כבר תפוס. בחרו שם אחר.' };
    }

    const newUser = {
      id: generateId('u'),
      username: cleanUsername,
      displayName: cleanDisplay,
      password,
      role,
      status: 'active',
      avatarColor: pickAvatarColor(cleanUsername + cleanDisplay),
      createdAt: Date.now()
    };

    state.users.push(newUser);
    if (autoLogin) {
      state.currentUserId = newUser.id;
    }
    saveState();
    return { ok: true, user: newUser };
  }

  function kickUser(userId, alsoDeletePosts) {
    const user = getUserById(userId);
    if (!user) return;
    user.status = 'banned';

    if (state.currentUserId === userId) {
      state.currentUserId = null;
    }

    if (alsoDeletePosts) {
      state.posts = state.posts.filter(p => p.authorId !== userId);
      state.posts.forEach(p => {
        p.comments = p.comments.filter(c => c.authorId !== userId);
        p.likes = p.likes.filter(uid => uid !== userId);
      });
    }

    saveState();
    renderAll();
    showToast(`המשתמש "${user.displayName}" הורחק מהאתר${alsoDeletePosts ? ' ורשימותיו נמחקו' : ''}.`);
  }

  function deleteUserPermanently(userId, alsoDeletePosts) {
    const user = getUserById(userId);
    if (!user) return;

    state.users = state.users.filter(u => u.id !== userId);
    if (state.currentUserId === userId) {
      state.currentUserId = null;
    }

    if (alsoDeletePosts) {
      state.posts = state.posts.filter(p => p.authorId !== userId);
      state.posts.forEach(p => {
        p.comments = p.comments.filter(c => c.authorId !== userId);
        p.likes = p.likes.filter(uid => uid !== userId);
      });
    }

    saveState();
    renderAll();
    showToast(`המשתמש "${user.displayName}" נמחק לצמיתות.`);
  }

  function updateCategoryChipUI() {
    categoryChipsEl.querySelectorAll('.chip').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === uiState.category);
    });
  }

  // Global Event Listeners
  brandResetLinkEl.addEventListener('click', (e) => {
    e.preventDefault();
    uiState.category = 'הכל';
    uiState.search = '';
    uiState.sort = 'newest';
    searchInputEl.value = '';
    sortSelectEl.value = 'newest';
    updateCategoryChipUI();
    renderPosts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  searchInputEl.addEventListener('input', (e) => {
    uiState.search = e.target.value;
    renderPosts();
  });

  categoryChipsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    uiState.category = btn.dataset.category;
    updateCategoryChipUI();
    renderPosts();
  });

  sortSelectEl.addEventListener('change', (e) => {
    uiState.sort = e.target.value;
    renderPosts();
  });

  // Feed Delegated Events (Likes, Comments, Edit, Delete, Kick)
  postsFeedEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const postId = btn.dataset.postId;
    const currentUser = getCurrentUser();

    if (action === 'toggle-like') {
      if (!currentUser) {
        switchAuthTab('login');
        openModal(authModalEl);
        showToast('התחברו כדי לסמן "מעורר מחשבה"');
        return;
      }
      const post = state.posts.find(p => p.id === postId);
      if (!post) return;
      const idx = post.likes.indexOf(currentUser.id);
      if (idx === -1) {
        post.likes.push(currentUser.id);
      } else {
        post.likes.splice(idx, 1);
      }
      saveState();
      renderPosts();
      return;
    }

    if (action === 'toggle-comments') {
      if (uiState.expandedComments.has(postId)) {
        uiState.expandedComments.delete(postId);
      } else {
        uiState.expandedComments.add(postId);
      }
      renderPosts();
      return;
    }

    if (action === 'edit-post') {
      const post = state.posts.find(p => p.id === postId);
      if (!post || !currentUser || currentUser.id !== post.authorId) return;
      editPostIdEl.value = post.id;
      editPostTitleEl.value = post.title || '';

      const hasOption = Array.from(editPostCategoryEl.options).some(opt => opt.value === post.category);
      if (!hasOption && post.category) {
        const extraOpt = document.createElement('option');
        extraOpt.value = post.category;
        extraOpt.textContent = post.category;
        editPostCategoryEl.appendChild(extraOpt);
      }
      editPostCategoryEl.value = post.category;
      editPostBodyEl.value = post.body;
      openModal(editPostModalEl);
      return;
    }

    if (action === 'delete-post') {
      const post = state.posts.find(p => p.id === postId);
      if (!post || !currentUser) return;
      if (currentUser.id !== post.authorId && currentUser.role !== 'admin') return;

      openConfirmDialog({
        title: 'מחיקת רשימה',
        message: 'האם למחוק את הרשימה הזו לצמיתות?',
        confirmText: 'מחק רשימה',
        onConfirm: () => {
          state.posts = state.posts.filter(p => p.id !== postId);
          saveState();
          renderAll();
          showToast('הרשימה נמחקה');
        }
      });
      return;
    }

    if (action === 'delete-comment') {
      const commentId = btn.dataset.commentId;
      const post = state.posts.find(p => p.id === postId);
      if (!post || !currentUser) return;
      post.comments = post.comments.filter(c => c.id !== commentId);
      saveState();
      renderAll();
      showToast('התגובה נמחקה');
      return;
    }

    if (action === 'kick-user') {
      if (!currentUser || currentUser.role !== 'admin') return;
      const targetUser = getUserById(btn.dataset.userId);
      if (!targetUser || targetUser.id === currentUser.id) return;

      openConfirmDialog({
        title: `הרחקת המשתמש "${targetUser.displayName}"`,
        message: 'המשתמש ייחסם ולא יוכל להתחבר או לפרסם יותר בסלון.',
        confirmText: 'העף משתמש',
        extraCheckboxLabel: 'מחק גם את כל הרשימות והתגובות של המשתמש',
        onConfirm: (alsoDeletePosts) => {
          kickUser(targetUser.id, alsoDeletePosts);
        }
      });
    }
  });

  postsFeedEl.addEventListener('submit', (e) => {
    const form = e.target.closest('form[data-action="add-comment"]');
    if (!form) return;
    e.preventDefault();

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const postId = form.dataset.postId;
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;

    const input = form.querySelector('input[name="commentText"]');
    const text = input.value.trim();
    if (!text) return;

    post.comments.push({
      id: generateId('c'),
      authorId: currentUser.id,
      text,
      createdAt: Date.now()
    });
    uiState.expandedComments.add(postId);
    saveState();
    renderAll();
  });

  // Auth Modal Listeners
  tabLoginBtn.addEventListener('click', () => switchAuthTab('login'));
  tabRegisterBtn.addEventListener('click', () => switchAuthTab('register'));

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const res = loginByCredentials(username, password);
    if (!res.ok) {
      loginErrorEl.textContent = res.error;
      loginErrorEl.hidden = false;
    } else {
      loginForm.reset();
    }
  });

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const displayName = document.getElementById('regDisplayName').value;
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    const res = createUser({ displayName, username, password, role: 'user', autoLogin: true });
    if (!res.ok) {
      registerErrorEl.textContent = res.error;
      registerErrorEl.hidden = false;
      return;
    }
    registerForm.reset();
    closeModal(authModalEl);
    renderAll();
    showToast(`ברוך הבא להנבוכים, ${res.user.displayName}`, 'success');
  });

  quickAdminBtn.addEventListener('click', () => {
    loginByCredentials('admin', '1234');
  });

  quickUserBtn.addEventListener('click', () => {
    const res = loginByCredentials('daniel', '1234');
    if (!res.ok) {
      loginErrorEl.textContent = res.error;
      loginErrorEl.hidden = false;
    }
  });

  // Edit Post Form
  editPostForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentUser = getCurrentUser();
    const post = state.posts.find(p => p.id === editPostIdEl.value);
    if (!post || !currentUser || currentUser.id !== post.authorId) return;

    const newBody = editPostBodyEl.value.trim();
    if (!newBody) return;

    post.title = editPostTitleEl.value.trim();
    post.category = editPostCategoryEl.value;
    post.body = newBody;
    post.updatedAt = Date.now();

    saveState();
    closeModal(editPostModalEl);
    renderAll();
    showToast('הרשימה עודכנה', 'success');
  });

  // Admin Panel Listeners
  adminAddUserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    adminAddUserErrorEl.hidden = true;
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') return;

    const displayName = document.getElementById('adminNewDisplayName').value;
    const username = document.getElementById('adminNewUsername').value;
    const password = document.getElementById('adminNewPassword').value;
    const role = document.getElementById('adminNewRole').value;

    const res = createUser({ displayName, username, password, role, autoLogin: false });
    if (!res.ok) {
      adminAddUserErrorEl.textContent = res.error;
      adminAddUserErrorEl.hidden = false;
      return;
    }

    adminAddUserForm.reset();
    document.getElementById('adminNewPassword').value = '1234';
    renderAll();
    showToast(`המשתמש "${res.user.displayName}" נוסף בהצלחה`, 'success');
  });

  adminUsersListEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-admin-action]');
    if (!btn) return;

    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') return;

    const action = btn.dataset.adminAction;
    const targetUser = getUserById(btn.dataset.userId);
    if (!targetUser || targetUser.id === currentUser.id) return;

    if (action === 'kick') {
      openConfirmDialog({
        title: `הרחקת המשתמש "${targetUser.displayName}"`,
        message: 'המשתמש ייחסם ולא יוכל להתחבר יותר לאתר.',
        confirmText: 'העף משתמש',
        extraCheckboxLabel: 'מחק גם את כל הרשימות והתגובות של המשתמש',
        onConfirm: (alsoDeletePosts) => {
          kickUser(targetUser.id, alsoDeletePosts);
        }
      });
      return;
    }

    if (action === 'restore') {
      targetUser.status = 'active';
      saveState();
      renderAll();
      showToast(`הגישה של "${targetUser.displayName}" שוחזרה`, 'success');
      return;
    }

    if (action === 'delete-user') {
      openConfirmDialog({
        title: `מחיקת המשתמש "${targetUser.displayName}"`,
        message: 'המשתמש יוסר לחלוטין מרשימת המשתמשים.',
        confirmText: 'מחק לצמיתות',
        extraCheckboxLabel: 'מחק גם את כל הרשימות והתגובות שלו',
        onConfirm: (alsoDeletePosts) => {
          deleteUserPermanently(targetUser.id, alsoDeletePosts);
        }
      });
    }
  });

  resetDemoDataBtn.addEventListener('click', () => {
    openConfirmDialog({
      title: 'איפוס נתוני הסלון',
      message: 'פעולה זו תחזיר את כל הרשימות והמשתמשים למצב ההתחלתי.',
      confirmText: 'אפס נתונים',
      onConfirm: () => {
        state = createSeedState();
        state.currentUserId = 'u_admin';
        saveState();
        renderAll();
        showToast('נתוני הסלון אופסו בהצלחה', 'success');
      }
    });
  });

  // Confirm Dialog Action
  confirmActionBtn.addEventListener('click', () => {
    const extraChecked = !confirmExtraOptionEl.hidden && confirmExtraCheckboxEl.checked;
    const cb = pendingConfirmCallback;
    pendingConfirmCallback = null;
    closeModal(confirmModalEl);
    if (typeof cb === 'function') {
      cb(extraChecked);
    }
  });

  // Modal Close Handlers (Button, Backdrop, Escape)
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.closeModal;
      const modal = document.getElementById(targetId);
      if (modal) closeModal(modal);
    });
  });

  [authModalEl, editPostModalEl, adminModalEl, confirmModalEl].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      [confirmModalEl, editPostModalEl, adminModalEl, authModalEl].forEach(modal => {
        if (!modal.hidden) closeModal(modal);
      });
    }
  });

  // Initial Render
  renderAll();
})();
