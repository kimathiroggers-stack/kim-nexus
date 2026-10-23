const searchInput = document.getElementById("search");
const gradeSelect = document.getElementById("grade");
const subjectSelect = document.getElementById("subject");
const cards = document.getElementById("cards");
const summary = document.getElementById("result-summary");
const empty = document.getElementById("empty");
let designs = [];

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}
function buildSubjectOptions() {
  [...new Set(designs.map(d => d.subject))].sort((a,b)=>a.localeCompare(b)).forEach(subject => {
    const option = document.createElement("option");
    option.value = subject;
    option.textContent = subject;
    subjectSelect.appendChild(option);
  });
}
function render() {
  const q = searchInput.value.trim().toLowerCase();
  const grade = gradeSelect.value;
  const subject = subjectSelect.value;
  const filtered = designs.filter(d =>
    (grade === "all" || d.grade === grade) &&
    (subject === "all" || d.subject === subject) &&
    (!q || `${d.subject} ${d.grade} ${d.searchText}`.includes(q))
  );
  summary.textContent = `${filtered.length} of ${designs.length} curriculum designs`;
  cards.innerHTML = filtered.map(d => `
    <article class="card">
      <div class="card-top"><span class="pdf-icon">PDF</span><span class="grade-pill">${esc(d.grade)}</span></div>
      <h3>${esc(d.subject)}</h3>
      <p class="meta">${d.pages} pages · Curriculum design</p>
      <p class="excerpt">${esc(d.excerpt || "Open the curriculum design to view its contents.")}</p>
      <div class="card-actions">
        <a class="btn btn-primary" href="${encodeURI(d.file)}" target="_blank" rel="noopener">View PDF ↗</a>
        <a class="btn btn-secondary" href="${encodeURI(d.file)}" download>Download</a>
      </div>
    </article>`).join("");
  empty.hidden = filtered.length !== 0;
}
searchInput.addEventListener("input", render);
gradeSelect.addEventListener("change", render);
subjectSelect.addEventListener("change", render);
document.getElementById("clear").addEventListener("click", () => {
  searchInput.value = ""; gradeSelect.value = "Grade 7"; subjectSelect.value = "all"; render();
});
fetch("curriculum-search-index.json")
  .then(response => { if (!response.ok) throw new Error("Could not load the search index"); return response.json(); })
  .then(data => { designs = data; buildSubjectOptions(); document.getElementById("resource-count").textContent = designs.length; render(); })
  .catch(() => {
    summary.textContent = "The search index could not be loaded.";
    cards.innerHTML = '<div class="empty"><strong>Library data did not load.</strong><span>Make sure curriculum-search-index.json is uploaded beside curriculum.html.</span></div>';
  });
