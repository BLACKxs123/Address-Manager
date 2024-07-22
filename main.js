document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const contactsList = document.getElementById('contactsList');
    const addBtn = document.getElementById('addBtn'); // Get the add button

    // Fetch contacts from the API on load
    fetchContacts();

    // Event listener for form submission
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // Get form values
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const addressLine1 = document.getElementById('address_line_1').value.trim();
        const addressLine2 = document.getElementById('address_line_2').value.trim();
        const additionalNotes = document.getElementById('additional_notes').value.trim();

        // Validate required fields
        if (name === '' || email === '') {
            alert('Name and Email fields are required.');
            return;
        }

        // Create contact object
        const contact = {
            name,
            email,
            phone,
            addressLine1,
            addressLine2,
            additionalNotes,
        };

        // Check if we are adding a new contact or updating an existing one
        if (addBtn.dataset.contactId) { // Updating an existing contact
            const contactId = addBtn.dataset.contactId; // Get contact ID from the button dataset

            // Update the contact in the API
            updateContactToAPI(contact, contactId)
                .then(() => {
                    // Update the UI
                    updateContactInUI(contact);
                    // Reset the form and button
                    resetFormAndButton();
                })
                .catch(error => {
                    console.error('Error updating contact:', error);
                    // Handle error (e.g., display an error message)
                });
        } else { // Adding a new contact
            // Send contact to the API
            saveContactToAPI(contact)
                .then(savedContact => {
                    // Add contact to the list
                    addContact(savedContact);
                    // Reset the form
                    contactForm.reset();
                })
                .catch(error => {
                    console.error('Error saving contact:', error);
                    // Handle error (e.g., display an error message)
                });
        }
    });

    // Function to fetch contacts from the API
    async function fetchContacts() {
        try {
            const response = await fetch('http://localhost:3000/contacts');
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            const contacts = await response.json();
            contacts.forEach(addContact);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    }

    // Function to add a contact to the list
    function addContact(contact) {
        // Create a new contact entry
        const contactItem = document.createElement('div');
        contactItem.classList.add('contact-item');
        contactItem.setAttribute('data-contact-id', contact.id); // Set data-contact-id attribute
        contactItem.innerHTML = `
            <strong>${contact.name}</strong><br>
            Email: ${contact.email}<br>
            Phone: ${contact.phone}<br>
            Address: ${contact.addressLine1},<br>
            Address 2: ${contact.addressLine2}<br>
            Notes: ${contact.additionalNotes}<br><br>
            <button class="edit-btn" data-contact-id="${contact.id}">Edit</button> 
            <button class="delete-btn" data-contact-id="${contact.id}">Delete</button>
        `;

        // Append to contacts list
        contactsList.appendChild(contactItem);

        // Event listeners for Edit and Delete buttons
        const editButton = contactItem.querySelector('.edit-btn');
        const deleteButton = contactItem.querySelector('.delete-btn');

        editButton.addEventListener('click', () => {
            editContact(contact);
        });

        deleteButton.addEventListener('click', () => {
            deleteContact(contact.id);
        });
    }

    // Function to save a contact to the API
    async function saveContactToAPI(contact) {
        try {
            const response = await fetch('http://localhost:3000/contacts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(contact),
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const savedContact = await response.json(); // Parse response to JSON
            return savedContact;
        } catch (error) {
            console.error('Error saving contact to API:', error);
            throw error;
        }
    }

    // Function to update a contact in the API
    async function updateContactToAPI(contact, contactId) {
        try {
            const response = await fetch(`http://localhost:3000/contacts/${contactId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(contact),
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            return contact; // Return the updated contact
        } catch (error) {
            console.error('Error updating contact to API:', error);
            throw error;
        }
    }

    // Function to delete a contact from the API
    async function deleteContact(contactId) {
        try {
            const response = await fetch(`http://localhost:3000/contacts/${contactId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            // Remove the contact from the UI
            const contactItem = contactsList.querySelector(`.contact-item[data-contact-id="${contactId}"]`);
            contactsList.removeChild(contactItem);
        } catch (error) {
            console.error('Error deleting contact:', error);
            // Handle error (e.g., display an error message)
        }
    }

    // Function to edit a contact
    function editContact(contact) {
        // Populate the form fields with existing contact data
        document.getElementById('name').value = contact.name;
        document.getElementById('email').value = contact.email;
        document.getElementById('phone').value = contact.phone;
        document.getElementById('address_line_1').value = contact.addressLine1;
        document.getElementById('address_line_2').value = contact.addressLine2;
        document.getElementById('additional_notes').value = contact.additionalNotes;

        // Change the submit button to "Update"
        addBtn.textContent = 'Update Contact';
        addBtn.dataset.contactId = contact.id; // Store contact ID in the button dataset

        // Attach an event listener to the "Update" button
        addBtn.removeEventListener('click', saveContact);
        addBtn.addEventListener('click', function(event) {
            event.preventDefault();
            const updatedContact = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                addressLine1: document.getElementById('address_line_1').value.trim(),
                addressLine2: document.getElementById('address_line_2').value.trim(),
                additionalNotes: document.getElementById('additional_notes').value.trim(),
            };

            updateContactToAPI(updatedContact, contact.id)
                .then(() => {
                    updateContactInUI(updatedContact);
                    resetFormAndButton();
                })
                .catch(error => {
                    console.error('Error updating contact:', error);
                    // Handle error (e.g., display an error message)
                });
        });
    }

    // Function to reset the form and button
    function resetFormAndButton() {
        contactForm.reset();
        addBtn.textContent = 'Add Contact';
        addBtn.dataset.contactId = '';
        addBtn.removeEventListener('click', updateContact);
        addBtn.addEventListener('click', saveContact);
    }
});
