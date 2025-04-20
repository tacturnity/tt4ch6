document.addEventListener('DOMContentLoaded', function() {
    const toggleButtons = document.querySelectorAll('.toggle-button');

    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const solutionContent = this.nextElementSibling; // Get the .solution-content div

            // Check if the content is currently visible by checking the class
            const isVisible = solutionContent.classList.contains('visible');

            if (!isVisible) {
                // If hidden, make it visible
                solutionContent.classList.add('visible');
                // Optional: Set max-height specifically for smoother transition
                // solutionContent.style.maxHeight = solutionContent.scrollHeight + "px"; // Can cause jumpiness sometimes
                this.textContent = 'Hide Answer & Solution';
            } else {
                // If visible, hide it
                solutionContent.classList.remove('visible');
                // Optional: Reset max-height if using the specific approach
                // solutionContent.style.maxHeight = null;
                this.textContent = 'Show Answer & Solution';
            }
        });
    });

    // Ensure math rendering is called AFTER dynamic content potentially loaded/styled
    // Since content is static here but hidden, the initial render might be okay,
    // but triggering again or ensuring render happens within visible elements can help.
    if (window.renderMathInElement) {
        renderMathInElement(document.body, {
            delimiters: [
                 {left: '$$', right: '$$', display: true},
                 {left: '$', right: '$', display: false},
                 {left: '\\(', right: '\\)', display: false},
                 {left: '\\[', right: '\\]', display: true}
            ]
        });
    }
});