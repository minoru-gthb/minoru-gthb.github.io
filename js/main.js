
let allPanels;

document.addEventListener("DOMContentLoaded", function () {
  const globalPanels = document.getElementById("global-panels");

  fetch("../components/panels.html")
    .then(res => res.text())
    .then(html => {
      globalPanels.innerHTML = html;

      // パネル挿入後に少し待って DOM を反映させる
      requestAnimationFrame(() => {
        // さらに短い遅延で安全に
        setTimeout(() => {
          initializePanelBehavior(); // DOM反映後に初期化
        }, 0);
      });
    });

  function initializePanelBehavior() {
    const labelContainers = document.querySelectorAll(".label-container");
    allPanels = document.querySelectorAll(".category-panel");
    const labels = document.querySelector(".category-labels");

    if (!labels || allPanels.length === 0) {
      console.warn("パネルまたはラベルが取得できません");
      return;
    }

    function getLabelBottom() {
      const rect = labels.getBoundingClientRect();
      return rect.bottom;
    }

    function updatePanelPosition() {
      const offset = getLabelBottom();
      allPanels.forEach(panel => {
        panel.style.top = `${offset}px`;
      });
    }

    fetch("/articles.json")
      .then(res => res.json())
      .then(articles => {
        const tagToPanelId = {
          project: "panel-red",
          tool: "panel-orange",
          art: "panel-yellow",
          ui: "panel-green",
          script: "panel-blue",
          other: "panel-purple"
        };

        // 各カテゴリごとに分配
        for (const [tag, panelId] of Object.entries(tagToPanelId)) {
          const panel = document.querySelector(`#${panelId}`);
          if (!panel) continue;

          const columns = panel.querySelectorAll(".column");
          if (columns.length === 0) continue;

          // 対象の記事を抽出
          const matchedArticles = articles.filter(article =>
            article.tags.includes(tag)
          );
          
          // 安全のため一度すべてのulをクリア
          columns.forEach(col => {
            const ul = col.querySelector("ul");
            if (ul) ul.innerHTML = "";
          });

          let colIndex = 0;
          let itemCount = 0;

          matchedArticles.forEach(article => {
            if (colIndex >= columns.length) return; // カラム超過したら無視

            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = article.url;
            a.textContent = article.title;
            a.classList.add("dark-link");
            li.appendChild(a);

            const currentUl = columns[colIndex].querySelector("ul");
            currentUl.appendChild(li);

            itemCount++;
            if (itemCount >= 12) {
              colIndex++;
              itemCount = 0;
            }
          });
        }
      });

    // 初期設定とスクロールイベントで更新
    window.addEventListener("scroll", updatePanelPosition);
    window.addEventListener("resize", updatePanelPosition);
    updatePanelPosition();

    // ラベルクリック
    labelContainers.forEach(container => {
      container.addEventListener("click", () => {
        const targetId = container.getAttribute("data-target");

        allPanels.forEach(panel => {
          if (panel.id === targetId) {
            panel.classList.toggle("show");
          } else {
            panel.classList.remove("show");
          }
        });
        updatePanelPosition(); // 表示後にも更新
      });
    });

    // パンくずリストから開く
    document.querySelectorAll(".open-panel").forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();  // ここでバブルアップを止める
        const targetId = link.getAttribute("data-target");

        allPanels.forEach(panel => {
          if (panel.id === targetId) {
            panel.classList.toggle("show");
          } else {
            panel.classList.remove("show");
          }
        });
        updatePanelPosition(); // 表示後にも更新
      });
    });

    // 外クリックで非表示
    document.addEventListener("click", function (event) {
      const isLabel = event.target.closest(".label-container");
      const isPanel = event.target.closest(".category-panel");
      if (!isLabel && !isPanel) {
        allPanels.forEach(panel => {
          panel.classList.remove("show");
        });
      }
    });
  }


});

let lastScrollY = window.scrollY;
const labels = document.querySelector('.category-labels');

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;

  if (currentScrollY > lastScrollY) {
    // 下スクロール中 → ラベル隠す
    labels.style.transform = 'translateY(-100%)';
  } else {
    // 上スクロール中 → ラベル見せる
    labels.style.transform = 'translateY(0)';
  }

  lastScrollY = currentScrollY;
});

