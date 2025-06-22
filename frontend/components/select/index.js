document.addEventListener('DOMContentLoaded', () => {
    const categorySelect = document.getElementById('category-select');
    const newCategoryWrapper = document.getElementById('new-category-wrapper');
    const newCategoryInput = document.getElementById('new-category-input');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const createNewOption = document.getElementById('create-new-option');

    categorySelect.addEventListener('change', () => {
        if (categorySelect.value === 'add_new_category') {
            newCategoryWrapper.style.display = 'block'; 
            newCategoryInput.focus(); 
        } else {
            newCategoryWrapper.style.display = 'none';
        }
    });

    addCategoryBtn.addEventListener('click', () => {
        const newCategoryValue = newCategoryInput.value.trim(); 

        if (newCategoryValue) {
            const newOption = document.createElement('option');
            newOption.value = newCategoryValue;
            newOption.textContent = newCategoryValue;
            newOption.selected = true; 

            categorySelect.insertBefore(newOption, createNewOption);

            newCategoryInput.value = '';
            newCategoryWrapper.style.display = 'none';
        } else {
            alert('Please enter a valid category name.');
        }
    });

    // document.getElementById('income-form').addEventListener('submit', (event) => {
    //     event.preventDefault(); // Prevents the page from reloading
    //     const selectedCategory = categorySelect.value;

    //     if (selectedCategory && selectedCategory !== 'add_new_category') {
    //         alert(`Form submitted with Category: ${selectedCategory}`);
    //         // In a real application, you would send this data to the server.
    //     } else {
    //         alert('Please select or create a category before submitting.');
    //     }
    // });
});
