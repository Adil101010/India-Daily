/* ========== ARTICLE PAGE — FINAL CLEAN ========== */

(async function () {

  const API_BASE = "http://localhost:8080";
  const PLACEHOLDER = "images/placeholder.jpg";

  // ------- URL → slug -------
  function getSlug() {
    const url = new URL(window.location.href);
    return url.searchParams.get("slug");
  }

  // Escape HTML (for text only)
  const esc = (s = "") => {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  };

  // Date format (only date)
  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "";

  // Error view
  function showError(msg) {
    const card = document.getElementById("articleCard");
    if (!card) return;
    card.innerHTML = `
      <h2 style="padding:20px;color:#333;text-align:center;">${esc(msg)}</h2>
    `;
  }

  // ------- GET SLUG -------
  const slug = getSlug();
  if (!slug) {
    showError("Invalid Article URL");
    return;
  }
  console.log("🔍 Article slug =", slug);

  // ------- FETCH ARTICLE -------
  let article = null;
  try {
    const res = await fetch(`${API_BASE}/api/public/news/article/${slug}`);
    if (!res.ok) throw new Error("Not found");
    article = await res.json();
    console.log("✅ Article loaded:", article);
  } catch (e) {
    console.error("❌ Article fetch error:", e);
    showError("Article not found.");
    return;
  }

  // =====================
  // POPULATE ARTICLE
  // =====================

  // Featured image
  const img = article.imageUrl || PLACEHOLDER;
  const imgWrap = document.getElementById("featuredImgWrap");
  if (imgWrap) {
    imgWrap.innerHTML = `
      <img src="${esc(img)}"
           alt="${esc(article.title || "")}"
           loading="lazy">
    `;
  }

  // Title
  document.getElementById("articleTitle").textContent =
    article.title || "Untitled";

  // Category
  document.getElementById("articleCategory").textContent =
    article.category || "";

  // Author (name string)
  const authorName =
    (article.author && article.author.name) || article.author || "India Daily";

  // Date (for meta row)
  document.getElementById("articleDate").textContent = fmtDate(
    article.publishedAt
  );

  // SEO title + meta
  const pageTitleEl = document.getElementById("pageTitle");
  if (pageTitleEl) {
    pageTitleEl.textContent = `${article.title} — India Daily`;
  }
  const metaDesc = document.getElementById("metaDescription");
  if (metaDesc) {
    metaDesc.setAttribute(
      "content",
      article.summary || article.title || "India Daily"
    );
  }

  // Breadcrumbs
  const bcCategory = document.getElementById("bcCategory");
  const bcTitle = document.getElementById("bcTitle");
  if (bcCategory) {
    bcCategory.textContent = article.category || "Category";
    bcCategory.href = `category.html?name=${encodeURIComponent(
      article.category || ""
    )}`;
  }
  if (bcTitle) {
    bcTitle.textContent = article.title || "Article";
  }

  // Body content (HTML from backend)
  const bodyEl = document.getElementById("articleBody");
  if (bodyEl) {
    bodyEl.innerHTML = article.content?.trim()
      ? article.content
      : "<p>No content available.</p>";
  }

  // Read time
  const words = article.content ? article.content.split(/\s+/).length : 100;
  const minutes = Math.max(1, Math.round(words / 200));
  const readTimeEl = document.getElementById("readTime");
  if (readTimeEl) readTimeEl.textContent = `${minutes} min read`;

  // ===== Published line (ONLY place author appears) =====
  const publishAuthorEl = document.getElementById("publishAuthor");
  const publishDateTimeEl = document.getElementById("publishDateTime");

  if (publishAuthorEl) publishAuthorEl.textContent = authorName;

  if (publishDateTimeEl) {
    const d = article.publishedAt ? new Date(article.publishedAt) : null;
    if (d) {
      publishDateTimeEl.textContent =
        " · " +
        d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }) +
        " at " +
        d.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }) +
        " IST";
    } else {
      publishDateTimeEl.textContent = "";
    }
  }

  // =====================
  // SHARE BUTTONS
  // =====================
  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(article.title || "");

  document.getElementById("shareFb")?.addEventListener("click", () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      "_blank"
    );
  });

  document.getElementById("shareX")?.addEventListener("click", () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
      "_blank"
    );
  });

  document.getElementById("shareWa")?.addEventListener("click", () => {
    window.open(`https://wa.me/?text=${shareTitle}%20${shareUrl}`, "_blank");
  });

  // =====================
  // RELATED ARTICLES
  // =====================
  let related = [];
  try {
    const res = await fetch(`${API_BASE}/api/public/news/latest?limit=30`);
    if (res.ok) {
      const list = await res.json();

      related = list.filter(
        (it) =>
          it.slug !== article.slug &&
          String(it.category || "").toLowerCase() ===
            String(article.category || "").toLowerCase()
      );

      if (related.length < 4) {
        related = list.filter((it) => it.slug !== article.slug);
      }

      related = related.slice(0, 4);
      console.log("✅ Related articles:", related);
    }
  } catch (e) {
    console.warn("❌ Related fetch failed", e);
  }

  const relatedGrid = document.getElementById("relatedGrid");
  if (relatedGrid) {
    if (!related.length) {
      relatedGrid.innerHTML =
        '<p style="color:#666;text-align:center;">No related articles found.</p>';
    } else {
      relatedGrid.innerHTML = related
        .map(
          (it) => `
        <a class="related-card" href="article.html?slug=${esc(it.slug)}">
          <div class="thumb">
            <img src="${esc(it.imageUrl || PLACEHOLDER)}"
                 loading="lazy"
                 alt="${esc(it.title || "")}"
                 onerror="this.src='${PLACEHOLDER}'">
          </div>
          <div class="body">
            <span class="kicker">${esc(it.category || "")}</span>
            <strong>${esc(it.title || "Untitled")}</strong>
            <div class="meta">${fmtDate(it.publishedAt)}</div>
          </div>
        </a>`
        )
        .join("");
    }
  }

  // =====================================================
  // COMMENTS SYSTEM
  // =====================================================

  const newsId = article.id;
  if (!newsId) {
    console.warn("News ID not found, comments disabled");
    return;
  }

  // Load comments
  async function loadComments() {
    try {
      const res = await fetch(
        `${API_BASE}/api/public/comments/news/${newsId}`
      );
      if (!res.ok) throw new Error("Failed to load comments");

      const comments = await res.json();
      console.log("✅ Comments loaded:", comments);

      const countEl = document.getElementById("commentCount");
      if (countEl) countEl.textContent = comments.length;

      const listEl = document.getElementById("commentsList");
      if (!listEl) return;

      if (!comments.length) {
        listEl.innerHTML = `
          <p style="color:#666;text-align:center;padding:30px;background:#f9f9f9;border-radius:10px;">
            No comments yet. Be the first to comment!
          </p>`;
        return;
      }

      listEl.innerHTML = comments
        .map(
          (c) => `
        <div class="comment-item">
          <div class="comment-header">
            <strong>${esc(c.userName)}</strong>
            <span class="comment-date">${fmtDate(c.createdAt)}</span>
          </div>
          <p>${esc(c.content)}</p>
        </div>`
        )
        .join("");
    } catch (e) {
      console.error("❌ Comments load error:", e);
      const listEl = document.getElementById("commentsList");
      if (listEl) {
        listEl.innerHTML =
          '<p style="color:#999;text-align:center;">Failed to load comments.</p>';
      }
    }
  }

  // Submit comment
  const submitBtn = document.getElementById("submitComment");
  if (submitBtn) {
    submitBtn.addEventListener("click", async () => {
      const userName = document.getElementById("userName")?.value.trim();
      const userEmail = document.getElementById("userEmail")?.value.trim();
      const content = document.getElementById("commentText")?.value.trim();
      const msgEl = document.getElementById("commentMsg");

      if (!userName || !userEmail || !content) {
        if (msgEl) {
          msgEl.style.color = "red";
          msgEl.textContent = "❌ Please fill all fields!";
        }
        return;
      }

      if (content.length < 10) {
        if (msgEl) {
          msgEl.style.color = "red";
          msgEl.textContent =
            "❌ Comment must be at least 10 characters!";
        }
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userEmail)) {
        if (msgEl) {
          msgEl.style.color = "red";
          msgEl.textContent = "❌ Please enter a valid email!";
        }
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Posting...";
      if (msgEl) msgEl.textContent = "";

      try {
        const res = await fetch(`${API_BASE}/api/public/comments/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newsId,
            userName,
            email: userEmail,
            content,
          }),
        });

        if (res.ok) {
          if (msgEl) {
            msgEl.style.color = "green";
            msgEl.textContent = "✅ Comment posted successfully!";
          }

          document.getElementById("userName").value = "";
          document.getElementById("userEmail").value = "";
          document.getElementById("commentText").value = "";

          setTimeout(() => {
            loadComments();
            if (msgEl) msgEl.textContent = "";
          }, 1500);
        } else {
          const errorText = await res.text();
          if (msgEl) {
            msgEl.style.color = "red";
            msgEl.textContent = "❌ " + errorText;
          }
        }
      } catch (e) {
        console.error("❌ Submit error:", e);
        if (msgEl) {
          msgEl.style.color = "red";
          msgEl.textContent =
            "❌ Network error! Please try again.";
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Post Comment";
      }
    });
  }

  // Initial comments load
  loadComments();
})();
