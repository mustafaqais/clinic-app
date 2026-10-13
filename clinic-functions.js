function initDraggableElements() {
    let activeBox = null;
    let startX = 0, startY = 0, initialX = 0, initialY = 0;

    document.querySelectorAll('.draggable-box').forEach(box => {
        box.style.touchAction = 'none';

        box.addEventListener('pointerdown', e => {
            if (!isConfigMode || e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
            activeBox = box;
            startX = e.clientX;
            startY = e.clientY;
            initialX = box.offsetLeft;
            initialY = box.offsetTop;
            box.setPointerCapture(e.pointerId);
            e.stopPropagation();
        });

        box.addEventListener('pointermove', e => {
            if (!activeBox || activeBox !== box) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            box.style.left = `${initialX + dx}px`;
            box.style.top = `${initialY + dy}px`;
        });

        box.addEventListener('pointerup', e => {
            if (activeBox === box) {
                activeBox = null;
                if (box.hasPointerCapture(e.pointerId)) {
                    box.releasePointerCapture(e.pointerId);
                }
            }
        });
    });
}

function renderDictTerms() {
    const cat = document.getElementById('dictCategorySelect').value;
    let dictKey = cat;
    if (cat === 'chiefComplaint') dictKey = 'chief_complaint';
    else if (cat === 'historyPresentIllness') dictKey = 'history_present';
    else if (cat === 'reviewSystems') dictKey = 'review_systems';

    const terms = medicalDict[dictKey] || [];
    const container = document.getElementById('dictItemsList');

    container.innerHTML = terms.length === 0 
        ? '<p style="text-align:center; color:#64748b;">No terms in this category.</p>'
        : terms.map((term, index) => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border:1px solid #cbd5e1; padding:8px 12px; border-radius:8px; margin-bottom:6px;">
                <span style="font-size:0.85rem; font-weight:600; color:#0f172a;">${term}</span>
                <div style="display:flex; gap:4px;">
                    <button onclick="editDictTerm('${cat}', ${index})" style="background:#e0f2fe; color:#0369a1; border:none; border-radius:6px; padding:4px 8px; font-size:0.72rem; cursor:pointer; font-weight:700;"><i class="fa-solid fa-pen"></i> تعديل</button>
                    <button onclick="removeDictTerm('${cat}', ${index})" style="background:#fee2e2; color:#ef4444; border:none; border-radius:6px; padding:4px 8px; font-size:0.72rem; cursor:pointer; font-weight:700;"><i class="fa-solid fa-trash"></i> حذف</button>
                </div>
            </div>
        `).join('') + `
            <div style="display:flex; gap:8px; margin-top:12px;">
                <div class="input-wrapper" style="flex:1;"><input type="text" id="newDictTermInput" placeholder="Add new term..."></div>
                <button class="btn-main" onclick="addNewDictTerm('${cat}')" style="width:auto; padding:0 16px;">Add</button>
            </div>
        `;
}

function editDictTerm(category, index) {
    let dictKey = category;
    if (category === 'chiefComplaint') dictKey = 'chief_complaint';
    else if (category === 'historyPresentIllness') dictKey = 'history_present';
    else if (category === 'reviewSystems') dictKey = 'review_systems';

    const terms = medicalDict[dictKey] || [];
    const currentTerm = terms[index] || '';
    const newTerm = prompt('تعديل المصطلح الطبي:', currentTerm);
    if (newTerm !== null && newTerm.trim() !== '') {
        terms[index] = newTerm.trim();
        saveSettingsToCloudAndLocal();
        renderDictTerms();
    }
}
