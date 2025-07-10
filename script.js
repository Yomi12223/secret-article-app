// --- タグ管理 ---
let tagList = JSON.parse(localStorage.getItem("tags") || "[]");

function saveTags() {
  localStorage.setItem("tags", JSON.stringify(tagList));
}

function renderTags() {
  const area = document.getElementById("tag-area");
  area.innerHTML = "";
  tagList.forEach(tag => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" value="${tag}"> ${tag}
      <button class="remove-tag" data-tag="${tag}">🗑</button>
    `;
    area.appendChild(label);
  });

  area.querySelectorAll(".remove-tag").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const tag = e.target.dataset.tag;
      tagList = tagList.filter(t => t !== tag);
      saveTags();
      renderTags();
    });
  });
}

document.getElementById("add-tag-btn").addEventListener("click", () => {
  const newTag = document.getElementById("new-tag").value.trim();
  if (newTag && !tagList.includes(newTag)) {
    tagList.push(newTag);
    saveTags();
    renderTags();
    document.getElementById("new-tag").value = "";
  }
});

renderTags();

// --- 装飾ボタン ---
const decorations = [
  { label: "見出し1", text: "# " },
  { label: "見出し2", text: "## " },
  { label: "見出し3", text: "### " },
  { label: "横線", text: "---\n" },
  { label: "太字", text: "**太字**" },
  { label: "斜体", text: "*斜体*" },
  { label: "打ち消し", text: "~~打ち消し~~" },
  { label: "コード", text: "```\nコード\n```" },
  { label: "引用", text: "> " },
  { label: "リスト", text: "- 項目" },
  { label: "番号リスト", text: "1. 項目" },
  { label: "チェック", text: "- [ ] チェック項目" },
  { label: "リンク", text: "[テキスト](https://example.com)" },
  { label: "画像", text: '<img src="images/ファイル名" alt="">' }
];

function insertText(text) {
  const editor = document.getElementById("editor");
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const before = editor.value.substring(0, start);
  const after = editor.value.substring(end);
  editor.value = before + text + after;
  editor.selectionStart = editor.selectionEnd = start + text.length;
  editor.focus();
}

const box = document.getElementById("decorator-buttons");
decorations.forEach(deco => {
  const btn = document.createElement("button");
  btn.textContent = deco.label;
  btn.addEventListener("click", () => insertText(deco.text));
  box.appendChild(btn);
});

document.getElementById("toggle-decorators").addEventListener("click", () => {
  const open = box.style.display === "block";
  box.style.display = open ? "none" : "block";
  document.getElementById("toggle-decorators").textContent = open ? "▶ 装飾" : "▼ 装飾";
});

// --- 画像挿入処理 ---
document.getElementById("image-input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const fileName = file.name;
    const imgTag = `<img src="images/${fileName}" alt="">`;
    insertText("\n" + imgTag + "\n");
    alert("画像タグを挿入しました。画像は手動で images/ フォルダに保存してください。");
  }
});

// --- プレビュー切り替え ---
let isPreview = false;
document.getElementById("btn-preview").addEventListener("click", () => {
  const editor = document.getElementById("editor");
  const preview = document.getElementById("preview");
  const btn = document.getElementById("btn-preview");

  if (isPreview) {
    editor.style.display = "block";
    preview.style.display = "none";
    btn.textContent = "プレビュー";
  } else {
    preview.innerHTML = marked.parse(editor.value);
    editor.style.display = "none";
    preview.style.display = "block";
    btn.textContent = "編集に戻る";
  }
  isPreview = !isPreview;
});

// --- 保存機能（.md with YAML） ---
document.getElementById("btn-save").addEventListener("click", () => {
  const title = document.getElementById("title").value.trim() || "untitled";
  const content = document.getElementById("editor").value;
  const tags = Array.from(document.querySelectorAll('#tag-area input:checked')).map(t => `"${t.value}"`);
  const today = new Date().toISOString().slice(0, 10);

  const fullText = `---\ntitle: ${title}\ndate: ${today}\ntags: [${tags.join(", ")}]\n---\n\n${content.replace(/\r\n?/g, "\n")}`;

  const blob = new Blob([fullText], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${title}.md`;
  a.click();
  URL.revokeObjectURL(url);
});
