document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('btn-save'); // 追加修正
  const previewBtn = document.getElementById('btn-preview'); // 正しく修正

  if (saveBtn) saveBtn.addEventListener('click', saveArticle);
  if (previewBtn) previewBtn.addEventListener('click', togglePreview); // ← togglePreview関数を呼ぶ

  if (location.pathname.includes('saved.html')) {
    loadSavedArticles();
  }
});


function saveArticle() {
  const title = document.getElementById('title').value.trim();
  const body = document.getElementById('body').value.trim();
  const tags = Array.from(document.querySelectorAll('.tag-item')).map(el => el.textContent);

  if (!title) return showMessage("タイトルを入力してください");
  if (!body) return showMessage("本文を入力してください");

  const article = {
    id: Date.now(),
    title,
    body,
    tags,
    created: new Date().toISOString()
  };

  const articles = JSON.parse(localStorage.getItem('articles') || '[]');
  articles.push(article);
  localStorage.setItem('articles', JSON.stringify(articles));

  showMessage("保存しました！");
  clearEditor();
}

function previewArticle() {
  const body = document.getElementById('body').value.trim();
  const previewWindow = window.open('', '_blank');
  previewWindow.document.write(`
    <html><head><title>プレビュー</title></head>
    <body style="padding: 2rem; background: #111; color: #eee;">
      ${marked.parse(body)}
    </body></html>
  `);
}

function showMessage(text) {
  let msg = document.getElementById('message');
  if (!msg) {
    msg = document.createElement('div');
    msg.id = 'message';
    msg.style.position = 'fixed';
    msg.style.bottom = '10px';
    msg.style.left = '50%';
    msg.style.transform = 'translateX(-50%)';
    msg.style.background = '#0a0';
    msg.style.color = '#fff';
    msg.style.padding = '0.5rem 1rem';
    msg.style.borderRadius = '5px';
    msg.style.zIndex = '9999';
    document.body.appendChild(msg);
  }
  msg.textContent = text;
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 3000);
}

function clearEditor() {
  document.getElementById('title').value = '';
  document.getElementById('body').value = '';
  const tagList = document.getElementById('tagList');
  if (tagList) tagList.innerHTML = '';
}

// 一覧画面用：保存済み記事を読み込む
function loadSavedArticles() {
  const list = document.getElementById('articleList');
  if (!list) return;

  const articles = JSON.parse(localStorage.getItem('articles') || '[]');
  if (articles.length === 0) {
    list.innerHTML = '<p>まだ記事がありません。</p>';
    return;
  }

  list.innerHTML = articles.map(article => `
    <div style="padding:1rem; border-bottom:1px solid #444;">
      <h3 style="margin:0;">${article.title}</h3>
      <p style="color:#888;">${new Date(article.created).toLocaleString()}</p>
      <div style="margin-top:0.5rem;">タグ: ${article.tags.join(', ')}</div>
    </div>
  `).join('');
}

// =============================
// 🔥 一時保存 & 復元処理
// =============================

// 定期的に本文・タイトル・タグを保存
setInterval(() => {
  const draft = {
    title: document.getElementById('title')?.value || '',
    body: document.getElementById('body')?.value || '',
    tags: Array.from(document.querySelectorAll('.tag-item')).map(el => el.textContent)
  };
  sessionStorage.setItem('draft', JSON.stringify(draft));
}, 5000); // 5秒ごと保存

// ページ読み込み時にドラフト復元
window.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('draft');
  if (saved) {
    const { title, body, tags } = JSON.parse(saved);
    document.getElementById('title').value = title || '';
    document.getElementById('body').value = body || '';
    const tagList = document.getElementById('tagList');
    if (tagList) {
      tagList.innerHTML = '';
      tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tag-item';
        span.textContent = tag;
        tagList.appendChild(span);
      });
    }
  }
});

// 離脱時に警告（保存されてない場合）
window.addEventListener('beforeunload', function (e) {
  const title = document.getElementById('title')?.value.trim();
  const body = document.getElementById('body')?.value.trim();
  if (title || body) {
    e.preventDefault();
    e.returnValue = '';
  }
});

function togglePreview() {
  const editor = document.getElementById('editor');
  const preview = document.getElementById('preview');
  const btn = document.getElementById('btn-preview');

  if (!editor || !preview || !btn) return;

  if (preview.style.display === 'block') {
    preview.style.display = 'none';
    editor.style.display = 'block';
    btn.textContent = 'プレビュー';
  } else {
    let markdownText = editor.value;
    markdownText = markdownText.replace(/<img[^>]*>/gi, '');
    markdownText = markdownText.replace(/!\[[^\]]*\]\([^)]+\)/g, '');
    preview.innerHTML = marked.parse(markdownText);
    preview.style.display = 'block';
    editor.style.display = 'none';
    btn.textContent = '編集に戻る';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btnPreview = document.getElementById('btn-preview');
  const editor = document.getElementById('editor');
  const preview = document.getElementById('preview');

  if(btnPreview && editor && preview) {
    btnPreview.addEventListener('click', () => {
      if (preview.style.display === 'block') {
        preview.style.display = 'none';
        editor.style.display = 'block';
        btnPreview.textContent = 'プレビュー';
      } else {
        let markdownText = editor.value;
        markdownText = markdownText.replace(/<img[^>]*>/gi, '');
        markdownText = markdownText.replace(/!\[[^\]]*\]\([^)]+\)/g, '');
        preview.innerHTML = marked.parse(markdownText);
        preview.style.display = 'block';
        editor.style.display = 'none';
        btnPreview.textContent = '編集に戻る';
      }
    });
  }
});
