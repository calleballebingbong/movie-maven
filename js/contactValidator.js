// validate contact
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) {
        console.log('Contact form missing');
        return; 
}

contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const reason = document.getElementById('reason').value;
    const subject = document.getElementById('subject').value;
    const messageDiv = document.getElementById('formMessage');
    messageDiv.innerHTML = '';
    messageDiv.className = 'message hidden';
    
    // Email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
        messageDiv.textContent = 'Please enter a valid email address.';
        messageDiv.className = 'message error';
        messageDiv.classList.remove('hidden');
        return;
    }
    
    if (!subject.trim()) {
        messageDiv.textContent = 'Please write a message.';
        messageDiv.className = 'message error';
        messageDiv.classList.remove('hidden');
        return;
    }
    
    messageDiv.textContent = 'Feedback sent! We\'ll reply soon.';
    messageDiv.className = 'message success';
    messageDiv.classList.remove('hidden');
    
    this.reset();
    });
});