// ================================
// Contact Form Functionality
// ================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ================================
    // Form Elements
    // ================================
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    
    if (!contactForm) return; // Exit if form doesn't exist
    
    // ================================
    // Form Validation Rules
    // ================================
    const validationRules = {
        name: {
            required: true,
            minLength: 2,
            maxLength: 50,
            pattern: /^[a-zA-Zぁ-んァ-ヶー一-龯\s]+$/,
            message: 'お名前を正しく入力してください（2-50文字）'
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: '有効なメールアドレスを入力してください'
        },
        phone: {
            required: false,
            pattern: /^[\d-+\s()]+$/,
            message: '有効な電話番号を入力してください'
        },
        subject: {
            required: true,
            message: 'お問い合わせ種別を選択してください'
        },
        message: {
            required: true,
            minLength: 10,
            maxLength: 1000,
            message: 'お問い合わせ内容を入力してください（10-1000文字）'
        }
    };
    
    // ================================
    // Validate Field
    // ================================
    function validateField(field) {
        const fieldName = field.name;
        const fieldValue = field.value.trim();
        const rules = validationRules[fieldName];
        
        if (!rules) return true;
        
        // Check required
        if (rules.required && !fieldValue) {
            return { valid: false, message: rules.message };
        }
        
        // Check pattern
        if (fieldValue && rules.pattern && !rules.pattern.test(fieldValue)) {
            return { valid: false, message: rules.message };
        }
        
        // Check min length
        if (fieldValue && rules.minLength && fieldValue.length < rules.minLength) {
            return { valid: false, message: rules.message };
        }
        
        // Check max length
        if (fieldValue && rules.maxLength && fieldValue.length > rules.maxLength) {
            return { valid: false, message: rules.message };
        }
        
        return { valid: true };
    }
    
    // ================================
    // Show Field Error
    // ================================
    function showFieldError(field, message) {
        // Remove existing error
        clearFieldError(field);
        
        // Add error class
        field.classList.add('error');
        
        // Create error message element
        const errorElement = document.createElement('span');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.color = '#f44336';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';
        errorElement.style.display = 'block';
        
        // Insert error message after field
        field.parentNode.appendChild(errorElement);
    }
    
    // ================================
    // Clear Field Error
    // ================================
    function clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    // ================================
    // Validate Form
    // ================================
    function validateForm() {
        let isValid = true;
        const fields = contactForm.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            const validation = validateField(field);
            if (!validation.valid) {
                showFieldError(field, validation.message);
                isValid = false;
            } else {
                clearFieldError(field);
            }
        });
        
        return isValid;
    }
    
    // ================================
    // Show Form Message
    // ================================
    function showFormMessage(message, type = 'success') {
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
        formMessage.style.display = 'block';
        
        // Scroll to message
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Auto hide after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);
        }
    }
    
    // ================================
    // Format Form Data
    // ================================
    function formatFormData(formData) {
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    }
    
    // ================================
    // Send Email (Simulation)
    // ================================
    async function sendEmail(data) {
        // In a real application, this would send data to a server
        // For now, we'll simulate an email send
        
        return new Promise((resolve, reject) => {
            // Simulate network delay
            setTimeout(() => {
                // Simulate success (in production, this would be an actual API call)
                console.log('Form submission data:', data);
                
                // Create email content
                const emailContent = `
                    新しいお問い合わせが届きました：

                    お名前: ${data.name}
                    メールアドレス: ${data.email}

                    メッセージ:
                    ${data.message}
                `;
                
                console.log(emailContent);
                
                // Randomly simulate success or failure for demo
                // In production, always resolve on successful API call
                resolve({
                    success: true,
                    message: 'お問い合わせを送信しました'
                });
            }, 1500);
        });
    }
    
    // ================================
    // Handle Form Submission
    // ================================
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous messages
        formMessage.style.display = 'none';
        
        // Validate form
        if (!validateForm()) {
            showFormMessage('入力内容を確認してください', 'error');
            return;
        }
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = formatFormData(formData);
        
        // Disable submit button
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 送信中...';
        
        try {
            // Send email
            const result = await sendEmail(data);
            
            if (result.success) {
                // Show success message
                showFormMessage(
                    'お問い合わせありがとうございます。2営業日以内にご返信いたします。',
                    'success'
                );
                
                // Reset form
                contactForm.reset();
                
                // Clear all field errors
                const fields = contactForm.querySelectorAll('input, select, textarea');
                fields.forEach(field => clearFieldError(field));
                
                // Track submission (for analytics)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        'event_category': 'engagement',
                        'event_label': 'contact_form'
                    });
                }
            } else {
                showFormMessage(
                    'エラーが発生しました。もう一度お試しください。',
                    'error'
                );
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showFormMessage(
                'エラーが発生しました。時間をおいて再度お試しください。',
                'error'
            );
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
    
    // ================================
    // Real-time Validation
    // ================================
    const formFields = contactForm.querySelectorAll('input, select, textarea');
    
    formFields.forEach(field => {
        // Validate on blur
        field.addEventListener('blur', function() {
            if (this.value.trim() || this.hasAttribute('required')) {
                const validation = validateField(this);
                if (!validation.valid) {
                    showFieldError(this, validation.message);
                } else {
                    clearFieldError(this);
                }
            }
        });
        
        // Clear error on input
        field.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                clearFieldError(this);
            }
        });
    });
    
    // ================================
    // Character Counter for Textarea
    // ================================
    const messageField = contactForm.querySelector('textarea[name="message"]');
    
    if (messageField) {
        // Create character counter
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.style.textAlign = 'right';
        counter.style.fontSize = '0.875rem';
        counter.style.color = 'rgba(255, 255, 255, 0.6)';
        counter.style.marginTop = '0.25rem';
        messageField.parentNode.appendChild(counter);
        
        // Update counter
        function updateCounter() {
            const length = messageField.value.length;
            const maxLength = validationRules.message.maxLength;
            counter.textContent = `${length} / ${maxLength}`;
            
            if (length > maxLength) {
                counter.style.color = '#f44336';
            } else if (length > maxLength * 0.8) {
                counter.style.color = '#F3A838';
            } else {
                counter.style.color = 'rgba(255, 255, 255, 0.6)';
            }
        }
        
        messageField.addEventListener('input', updateCounter);
        updateCounter();
    }
    
    // ================================
    // Auto-save Form Data
    // ================================
    const STORAGE_KEY = 'narrator_contact_form';
    
    // Load saved data
    function loadSavedData() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                Object.keys(data).forEach(key => {
                    const field = contactForm.querySelector(`[name="${key}"]`);
                    if (field) {
                        field.value = data[key];
                    }
                });
            } catch (error) {
                console.error('Error loading saved form data:', error);
            }
        }
    }
    
    // Save form data
    function saveFormData() {
        const formData = new FormData(contactForm);
        const data = formatFormData(formData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    
    // Load saved data on page load
    loadSavedData();
    
    // Save data on input
    formFields.forEach(field => {
        field.addEventListener('input', debounce(saveFormData, 1000));
    });
    
    // Clear saved data on successful submission
    contactForm.addEventListener('submit', function() {
        if (validateForm()) {
            localStorage.removeItem(STORAGE_KEY);
        }
    });
    
    // ================================
    // Utility Functions
    // ================================
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // ================================
    // Add Custom Styling for Errors
    // ================================
    const style = document.createElement('style');
    style.textContent = `
        .form-group input.error,
        .form-group select.error,
        .form-group textarea.error {
            border-color: #f44336 !important;
            background: rgba(244, 67, 54, 0.1) !important;
        }
        
        .field-error {
            animation: shake 0.5s;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .character-counter {
            transition: color 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
    // ================================
    // Spam Protection (Honeypot)
    // ================================
    // Add a hidden field that bots might fill
    const honeypot = document.createElement('input');
    honeypot.type = 'text';
    honeypot.name = 'website';
    honeypot.style.position = 'absolute';
    honeypot.style.left = '-9999px';
    honeypot.setAttribute('tabindex', '-1');
    honeypot.setAttribute('autocomplete', 'off');
    contactForm.appendChild(honeypot);
    
    // Check honeypot on submission
    contactForm.addEventListener('submit', function(e) {
        if (honeypot.value) {
            e.preventDefault();
            console.warn('Spam detected');
            return false;
        }
    });
});

// ================================
// Export Functions (if using modules)
// ================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateForm,
        sendEmail
    };
}