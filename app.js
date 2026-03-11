// File Upload UI Feedback removed

// Initial state from localStorage or empty
let students = JSON.parse(localStorage.getItem('students')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || {
    A: { name: 'Group A', link: 'https://chat.whatsapp.com/exampleA' },
    B: { name: 'Group B', link: 'https://chat.whatsapp.com/exampleB' },
    C: { name: 'Group C', link: 'https://chat.whatsapp.com/exampleC' },
    D: { name: 'Group D', link: 'https://chat.whatsapp.com/exampleD' }
};
let emailTemplate = localStorage.getItem('emailTemplate') || "Dear {name},\n\nYou have been added to {group}. Here is your group link: {link}\n\nRegards,\nYour Teacher";

// Handle Student Submission
const submissionForm = document.getElementById('submissionForm');
if (submissionForm) {
    submissionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('studentName').value;
        const whatsappNumber = document.getElementById('whatsappNumber').value;
        const link = document.getElementById('assignmentLink').value;
        const notes = document.getElementById('notes').value;

        let fileData = null;

        const newStudent = {
            id: Date.now(),
            name: name,
            whatsapp: whatsappNumber,
            link: link,
            file: fileData,
            notes: notes,
            submittedAt: new Date().toISOString(),
            status: 'pending',
            category: null
        };

        students.push(newStudent);
        localStorage.setItem('students', JSON.stringify(students));

        // UI Feedback
        document.getElementById('submissionForm').classList.add('hidden');
        document.getElementById('successMessage').classList.remove('hidden');
    });
}

function resetForm() {
    document.getElementById('submissionForm').reset();
    document.getElementById('submissionForm').classList.remove('hidden');
    document.getElementById('successMessage').classList.add('hidden');
}

// Teacher Dashboard Logic
function renderDashboard() {
    const listElement = document.getElementById('studentList');
    if (!listElement) return;

    listElement.innerHTML = '';
    const pendingStudents = students.filter(s => s.status === 'pending');

    if (pendingStudents.length === 0) {
        listElement.innerHTML = '<div class="glass-card" style="text-align:center; color: var(--text-muted);">No new submissions</div>';
        return;
    }

    pendingStudents.forEach(student => {
        const card = document.createElement('div');
        card.className = 'student-card';
        
        let assignmentDisplay = student.link ? `<a href="${student.link}" target="_blank" style="color: var(--primary); font-size: 0.8rem;">View Link</a>` : '';
        if (student.file) {
            const icon = student.file.type.includes('pdf') ? 'file-text' : 
                         student.file.type.includes('video') ? 'video' : 'file-archive';
            assignmentDisplay += `
                <div class="file-info" style="margin-top: 5px; font-size: 0.8rem; color: #22c55e;">
                    <i data-lucide="${icon}" style="width: 14px; vertical-align: middle;"></i> 
                    ${student.file.name} (${student.file.size})
                </div>
            `;
        }

        card.innerHTML = `
            <div class="student-info">
                <h3>${student.name}</h3>
                <p><i data-lucide="phone" style="width: 14px; vertical-align: middle;"></i> ${student.whatsapp || student.roll}</p>
                ${assignmentDisplay}
            </div>
            <div class="category-tags">
                <button onclick="assignCategory(${student.id}, 'A')" class="cat-btn a">A</button>
                <button onclick="assignCategory(${student.id}, 'B')" class="cat-btn b">B</button>
                <button onclick="assignCategory(${student.id}, 'C')" class="cat-btn c">C</button>
                <button onclick="assignCategory(${student.id}, 'D')" class="cat-btn d">D</button>
            </div>
        `;
        listElement.appendChild(card);
    });

    // Refresh lucide icons for dynamic content
    if (window.lucide) window.lucide.createIcons();

    updateStats();
}

function assignCategory(studentId, cat) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        student.status = 'assigned';
        student.category = cat;
        localStorage.setItem('students', JSON.stringify(students));
        
        // Simulate auto-generated email
        const groupInfo = categories[cat];
        const personalizedEmail = emailTemplate
            .replace('{name}', student.name)
            .replace('{group}', groupInfo.name)
            .replace('{link}', groupInfo.link);
        
        alert(`Email Sent to ${student.name}!\n\nContent:\n${personalizedEmail}`);
        
        renderDashboard();
        renderAssignedFolders();
    }
}

function renderAssignedFolders() {
    const foldersContainer = document.getElementById('assignedFolders');
    if (!foldersContainer) return;

    foldersContainer.innerHTML = '';
    ['A', 'B', 'C', 'D'].forEach(cat => {
        const catStudents = students.filter(s => s.category === cat);
        const folder = document.createElement('div');
        folder.className = 'stats-card';
        folder.innerHTML = `
            <h4 style="margin-bottom: 1rem; color: var(--primary);">Category ${cat} (${catStudents.length})</h4>
            <div style="font-size: 0.85rem; max-height: 150px; overflow-y: auto;">
                ${catStudents.map(s => {
                    let icon = 'user';
                    if (s.file) {
                        icon = s.file.type.includes('pdf') ? 'file-text' : 
                               s.file.type.includes('video') ? 'video' : 'file-archive';
                    }
                    return `<div style="margin-bottom: 5px; display: flex; align-items: center; gap: 5px;">
                                <i data-lucide="${icon}" style="width: 12px;"></i> ${s.name}
                            </div>`;
                }).join('') || '<span style="color:var(--text-muted)">Empty</span>'}
            </div>
        `;
        foldersContainer.appendChild(folder);
    });
    if (window.lucide) window.lucide.createIcons();
}

function updateStats() {
    const pendingCount = students.filter(s => s.status === 'pending').length;
    const assignedCount = students.filter(s => s.status === 'assigned').length;
    
    if (document.getElementById('pendingCount')) document.getElementById('pendingCount').innerText = pendingCount;
    if (document.getElementById('assignedCount')) document.getElementById('assignedCount').innerText = assignedCount;
}

// Config Panel Logic
function saveConfig() {
    const updatedCategories = {
        A: { name: 'Group A', link: document.getElementById('linkA').value },
        B: { name: 'Group B', link: document.getElementById('linkB').value },
        C: { name: 'Group C', link: document.getElementById('linkC').value },
        D: { name: 'Group D', link: document.getElementById('linkD').value }
    };
    const updatedTemplate = document.getElementById('emailEditor').value;

    localStorage.setItem('categories', JSON.stringify(updatedCategories));
    localStorage.setItem('emailTemplate', updatedTemplate);
    alert('Settings Saved Successfully!');
}

function loadConfig() {
    if (document.getElementById('linkA')) {
        document.getElementById('linkA').value = categories.A.link;
        document.getElementById('linkB').value = categories.B.link;
        document.getElementById('linkC').value = categories.C.link;
        document.getElementById('linkD').value = categories.D.link;
        document.getElementById('emailEditor').value = emailTemplate;
    }
}

// Run on load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('studentList')) {
        renderDashboard();
        renderAssignedFolders();
        loadConfig();
    }
});
