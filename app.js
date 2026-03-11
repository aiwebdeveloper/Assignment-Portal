// Storage initializations
let students = JSON.parse(localStorage.getItem('students')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || {
    A: { name: 'Group A', link: 'https://chat.whatsapp.com/exampleA' },
    B: { name: 'Group B', link: 'https://chat.whatsapp.com/exampleB' },
    C: { name: 'Group C', link: 'https://chat.whatsapp.com/exampleC' },
    D: { name: 'Group D', link: 'https://chat.whatsapp.com/exampleD' }
};
let emailTemplate = localStorage.getItem('emailTemplate') || "Dear {name},\n\nYou have been added to {group}. Here is your group link: {link}\n\nRegards,\nYour Teacher";
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let teacherAccount = JSON.parse(localStorage.getItem('teacherAccount')) || { email: 'teacher@example.com', password: 'password123' };

// Student Auth Logic
const sLoginForm = document.getElementById('studentLoginForm');
const sRegForm = document.getElementById('studentSignupForm');

if (sRegForm) {
    sRegForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nm = document.getElementById('studRegName').value;
        const ph = document.getElementById('studRegPhone').value;
        const em = document.getElementById('studRegEmail').value;
        
        localStorage.setItem('currentUser', JSON.stringify({ name: nm, phone: ph, email: em, id: Date.now() }));
        window.location.href = 'student-portal.html';
    });
}

if (sLoginForm) {
    sLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const em = document.getElementById('studLoginEmail').value;
        const existing = JSON.parse(localStorage.getItem('currentUser'));
        if (!existing) {
            localStorage.setItem('currentUser', JSON.stringify({ name: "Student", phone: "03000000000", email: em, id: Date.now() }));
        }
        window.location.href = 'student-portal.html';
    });
}

function logoutStudent() {
    localStorage.removeItem('currentUser');
}

// Student Portal Init
const studentGreeting = document.getElementById('studentGreeting');
if (studentGreeting) {
    if (!currentUser) {
        window.location.href = 'index.html'; // Redirect to auth if not logged in
    } else {
        studentGreeting.innerText = `Hello, ${currentUser.name}!`;
        renderStudentSubmissions();
    }
}

function renderStudentSubmissions() {
    const list = document.getElementById('studentSubmissionsList');
    if (!list || !currentUser) return;
    
    const mySubs = students.filter(s => s.studentId === currentUser.id);
    if(mySubs.length === 0) {
        list.innerHTML = '<div style="color:var(--text-muted); font-size:0.9rem;">No submissions yet.</div>';
        return;
    }
    
    list.innerHTML = mySubs.map(s => `
        <div style="background: rgba(0,0,0,0.02); border: 1px solid var(--border-color); padding: 12px; border-radius: 8px; margin-bottom: 15px;">
            <div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 5px;">${new Date(s.submittedAt).toLocaleDateString()} - <span style="color:var(--primary); text-transform:uppercase;">${s.status}</span></div>
            <a href="${s.link}" target="_blank" style="font-size: 0.8rem; color: #3b82f6; text-decoration:none;">View Submission Link</a>
            ${s.category ? `<div style="font-size: 0.8rem; color:#22c55e; margin-top:5px; font-weight:600;">Assigned to ${s.category}</div>` : ''}
            
            ${s.teacherVoiceNote ? `
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #ccc;">
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom:5px;"><i data-lucide="mic" style="width:14px; vertical-align:middle;"></i> Teacher's Voice Feedback:</p>
                    <audio controls src="${s.teacherVoiceNote}" style="height: 35px; width: 100%;"></audio>
                </div>
            ` : ''}
        </div>
    `).join('');
    
    if (window.lucide) window.lucide.createIcons();
}

// Submission Logic (Student Portal)
const submissionForm = document.getElementById('submissionForm');
if (submissionForm) {
    submissionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!currentUser) return;

        const link = document.getElementById('assignmentLink').value;
        const notes = document.getElementById('notes').value;

        const newStudent = {
            id: Date.now(),
            studentId: currentUser.id,
            name: currentUser.name,
            whatsapp: currentUser.phone,
            link: link,
            notes: notes,
            submittedAt: new Date().toISOString(),
            status: 'pending',
            category: null,
            teacherVoiceNote: null
        };

        students.push(newStudent);
        localStorage.setItem('students', JSON.stringify(students));

        document.getElementById('submissionForm').classList.add('hidden');
        document.getElementById('successMessage').classList.remove('hidden');
        renderStudentSubmissions();
    });
}

function resetForm() {
    document.getElementById('submissionForm').reset();
    document.getElementById('submissionForm').classList.remove('hidden');
    document.getElementById('successMessage').classList.add('hidden');
}

// Teacher Profile Logic
const tProfileForm = document.getElementById('teacherProfileForm');
if (tProfileForm) {
    tProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const em = document.getElementById('tUpdateEmail').value;
        const pw = document.getElementById('tUpdatePass').value;
        if(em) teacherAccount.email = em;
        if(pw) teacherAccount.password = pw;
        localStorage.setItem('teacherAccount', JSON.stringify(teacherAccount));
        alert('Teacher Profile Updated Successfully!');
        tProfileForm.reset();
    });
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
        card.style.flexDirection = 'column';
        card.style.alignItems = 'flex-start';
        card.style.gap = '15px';
        
        let assignmentDisplay = student.link ? `<a href="${student.link}" target="_blank" style="color: var(--primary); font-size: 0.85rem; display:inline-block; margin-top:5px;">View Submitted Link</a>` : '';

        // Voice Message UI
        let voiceUI = student.teacherVoiceNote 
            ? `<div style="width:100%; margin-top: 10px;">
                <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:5px;">Your Feedback:</p>
                <audio controls src="${student.teacherVoiceNote}" style="height:30px; width:100%;"></audio>
               </div>` 
            : `<button id="recordBtn-${student.id}" onclick="startRecording('recordBtn-${student.id}', ${student.id})" style="background:transparent; border:1px solid #e2e8f0; border-radius:8px; padding:6px 12px; font-size:0.8rem; cursor:pointer; display:flex; align-items:center; gap:5px; margin-top:10px;">
                <i data-lucide="mic" style="width:14px;"></i> Record Voice Feedback
               </button>`;

        card.innerHTML = `
            <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-start;">
                <div class="student-info">
                    <h3>${student.name}</h3>
                    <p><i data-lucide="phone" style="width: 14px; vertical-align: middle;"></i> ${student.whatsapp}</p>
                    ${student.notes ? `<p style="margin-top:5px; font-style:italic; font-size:0.8rem;">Note: ${student.notes}</p>` : ''}
                    ${assignmentDisplay}
                </div>
                <div class="category-tags">
                    <button onclick="assignCategory(${student.id}, 'A')" class="cat-btn a">A</button>
                    <button onclick="assignCategory(${student.id}, 'B')" class="cat-btn b">B</button>
                    <button onclick="assignCategory(${student.id}, 'C')" class="cat-btn c">C</button>
                    <button onclick="assignCategory(${student.id}, 'D')" class="cat-btn d">D</button>
                </div>
            </div>
            ${voiceUI}
        `;
        listElement.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
    updateStats();
}

// MediaRecorder Logic for Voice Notes
let mediaRecorder;
let audioChunks = [];

async function startRecording(btnId, studentId) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
        
        mediaRecorder.start();
        
        const btn = document.getElementById(btnId);
        btn.innerHTML = '<i data-lucide="square" style="width:14px;"></i> Stop Recording...';
        btn.style.color = '#ef4444';
        btn.style.borderColor = '#ef4444';
        btn.onclick = () => stopRecording(studentId);
        if (window.lucide) window.lucide.createIcons();
        
    } catch(err) {
        alert("Microphone permission denied. Please allow microphone access to record voice notes.");
        console.error(err);
    }
}

function stopRecording(studentId) {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => {
                const base64Audio = reader.result;
                const st = students.find(s => s.id === studentId);
                if (st) {
                    st.teacherVoiceNote = base64Audio;
                    localStorage.setItem('students', JSON.stringify(students));
                    renderDashboard(); // Re-render to show audio player
                }
            };
            
            // stop mic tracks
            mediaRecorder.stream.getTracks().forEach(t => t.stop());
        };
        mediaRecorder.stop();
    }
}

function assignCategory(studentId, cat) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        student.status = 'assigned';
        student.category = cat;
        localStorage.setItem('students', JSON.stringify(students));
        
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
                    return `<div style="margin-bottom: 5px; display: flex; align-items: center; justify-content: space-between; gap: 5px; padding: 4px; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">
                                <div style="display: flex; align-items: center; gap: 5px;">
                                    <i data-lucide="user" style="width: 12px;"></i> ${s.name}
                                </div>
                                <button onclick="removeStudent(${s.id})" title="Remove Student" style="background: transparent; border: none; color: #ef4444; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 2px; border-radius: 4px;">
                                    <i data-lucide="trash-2" style="width: 14px;"></i>
                                </button>
                            </div>`;
                }).join('') || '<span style="color:var(--text-muted)">Empty</span>'}
            </div>
        `;
        foldersContainer.appendChild(folder);
    });
    if (window.lucide) window.lucide.createIcons();
}

function removeStudent(studentId) {
    if (confirm('Are you sure you want to remove this student?')) {
        students = students.filter(s => s.id !== studentId);
        localStorage.setItem('students', JSON.stringify(students));
        renderDashboard();
        renderAssignedFolders();
    }
}

function updateStats() {
    const pendingCount = students.filter(s => s.status === 'pending').length;
    const assignedCount = students.filter(s => s.status === 'assigned').length;
    
    if (document.getElementById('pendingCount')) document.getElementById('pendingCount').innerText = pendingCount;
    if (document.getElementById('assignedCount')) document.getElementById('assignedCount').innerText = assignedCount;
}

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

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('studentList')) {
        renderDashboard();
        renderAssignedFolders();
        loadConfig();
    }
});
