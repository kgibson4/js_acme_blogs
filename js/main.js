function createElemWithText(element = 'p', textContent = '', className) {
    const createdElement = document.createElement(element);
    createdElement.textContent = textContent;
    if (className) {
        createdElement.className = className;
    }
    return createdElement;
}

function createSelectOptions(users) {
    if (!Array.isArray(users)) {
        return undefined;
    }

    const optionsArray = [];

    for (const user of users) {
        const optionElement = document.createElement('option');
        optionElement.value = user.id;          // assign user id as value
        optionElement.textContent = user.name;  // assign user name as text
        optionsArray.push(optionElement);
    }

    return optionsArray;
}

function toggleCommentSection(postId) {
    // Return undefined if no postId is provided
    if (postId === undefined) return undefined;

    // Select the section with data-post-id equal to postId
    const section = document.querySelector(`section[data-post-id="${postId}"]`);

    // Return null if no section is found
    if (!section) return null;

    // Toggle the 'hide' class
    section.classList.toggle('hide');

    // Return the section element
    return section;
}

function toggleCommentButton(postId) {
    if (!postId) return undefined; // return undefined if no postId provided

    // Select the button with data-post-id equal to postId
    const button = document.querySelector(`button[data-post-id="${postId}"]`);

    // Return null if no button is found
    if (!button) return null;

    // Toggle the textContent
    button.textContent = button.textContent === 'Show Comments' 
        ? 'Hide Comments' 
        : 'Show Comments';

    // Return the button element
    return button;
}

function deleteChildElements(parentElement) {
    // Check if the parameter is a valid HTML element
    if (!(parentElement instanceof HTMLElement)) return undefined;

    let child = parentElement.lastElementChild;

    while (child) {
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }

    return parentElement;
}

function addButtonListeners() {
    // Select all buttons inside the main element
    const buttons = document.querySelectorAll('main button');

    // Loop through each button
    buttons.forEach(button => {
        const postId = button.dataset.postId;
        if (postId) {
            // Add a click listener that calls toggleComments with event and postId
            button.addEventListener('click', function(event) {
                toggleComments(event, postId);
            });
        }
    });

    // Return the NodeList of buttons
    return buttons;
}

function removeButtonListeners() {
    const buttons = document.querySelectorAll('main button');

    buttons.forEach(button => {
        const postId = button.dataset.postId; // match dataset key used in addButtonListeners
        if (postId) {
            button.removeEventListener('click', function(event) {
                toggleComments(event, postId);
            });
        }
    });

    return buttons;
}

function createComments(comments) {
    // Return undefined if no parameter is received
    if (!comments) return undefined;

    const fragment = document.createDocumentFragment();

    comments.forEach(comment => {
        const article = document.createElement('article');
        const h3 = createElemWithText('h3', comment.name);
        const pBody = createElemWithText('p', comment.body);
        const pEmail = createElemWithText('p', `From: ${comment.email}`);

        article.append(h3, pBody, pEmail);
        fragment.appendChild(article);
    });

    return fragment;
}

function populateSelectMenu(users) {
    // Return undefined if no parameter is received
    if (!users) return undefined;

    const selectMenu = document.getElementById('selectMenu');
    if (!selectMenu) return undefined;

    const options = createSelectOptions(users);

    if (Array.isArray(options)) {
        options.forEach(option => selectMenu.appendChild(option));
    }

    return selectMenu;
}

async function getUsers() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const users = await response.json();
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        return null;
    }
}

async function getUserPosts(userId) {
    if (userId === undefined) return undefined;

    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const posts = await response.json();
        return posts;
    } catch (error) {
        console.error(`Error fetching posts for user ${userId}:`, error);
        return null;
    }
}

async function getUser(userId) {
    if (userId === undefined) return undefined;

    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const user = await response.json();
        return user;
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        return null;
    }
}

async function getPostComments(postId) {
    if (postId === undefined) return undefined;

    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const comments = await response.json();
        return comments;
    } catch (error) {
        console.error(`Error fetching comments for post ${postId}:`, error);
        return null;
    }
}

async function displayComments(postId) {
    if (postId === undefined) return undefined;

    // Create section element
    const section = document.createElement('section');
    section.dataset.postId = postId;
    section.classList.add('comments', 'hide');

    // Fetch comments for the post
    const comments = await getPostComments(postId);
    if (comments) {
        const fragment = createComments(comments);
        if (fragment) section.appendChild(fragment);
    }

    return section;
}

async function createPosts(posts) {
    if (!posts) return undefined;

    const fragment = document.createDocumentFragment();

    for (const post of posts) {
        const article = document.createElement('article');

        const h2 = createElemWithText('h2', post.title);
        const pBody = createElemWithText('p', post.body);
        const pPostId = createElemWithText('p', `Post ID: ${post.id}`);

        const author = await getUser(post.userId);
        const pAuthor = createElemWithText('p', `Author: ${author?.name} with ${author?.company?.name || ''}`);
        const pCatchPhrase = createElemWithText('p', author?.company?.catchPhrase || '');

        const button = createElemWithText('button', 'Show Comments');
        button.dataset.postId = post.id;

        const section = await displayComments(post.id);

        // Append all elements to article
        article.append(h2, pBody, pPostId, pAuthor, pCatchPhrase, button, section);
        fragment.appendChild(article);
    }

    return fragment;
}

async function displayPosts(posts) {
    const main = document.querySelector('main');
    if (!main) return undefined;

    // Determine what to display: posts or default paragraph
    const element = posts && posts.length
        ? await createPosts(posts)
        : createElemWithText('p', 'Select an Employee to display their posts.');

    // Add default-text class if no posts
    if (!posts || posts.length === 0) {
        element.classList.add('default-text');
    }

    main.appendChild(element);
    return element;
}

function toggleComments(event, postId) {
    if (!event || !postId) return undefined;

    event.target.listener = true; // for testing

    const section = toggleCommentSection(postId);
    const button = toggleCommentButton(postId);

    return [section, button];
}

async function refreshPosts(posts) {
    if (!posts) return undefined; // return undefined if no posts data provided

    // Remove button listeners
    const removeButtons = removeButtonListeners();

    // Delete all children of main element
    const main = document.querySelector('main');
    const mainElement = deleteChildElements(main);

    // Display posts and await fragment
    const fragment = await displayPosts(posts);

    // Re-add button listeners
    const addButtons = addButtonListeners();

    return [removeButtons, mainElement, fragment, addButtons];
}

async function selectMenuChangeEventHandler(event) {
    // Return undefined if no event is passed
    if (!event || !event.target) return undefined;

    const selectMenu = event.target;
    selectMenu.disabled = true;

    // Defines userId exactly as specified in criteria
    const userId = event.target.value || 1;

    // Fetch posts for the user
    const posts = await getUserPosts(userId);

    // Refresh posts display
    const refreshPostsArray = await refreshPosts(posts);

    selectMenu.disabled = false;

    return [userId, posts, refreshPostsArray];
}

async function initPage() {
    const users = await getUsers();
    const select = populateSelectMenu(users);

    return [users, select];
}

function initApp() {
    initPage(); // call async function but don’t await, as per instructions

    const selectMenu = document.getElementById('selectMenu');
    if (selectMenu) {
        selectMenu.addEventListener('change', selectMenuChangeEventHandler);
    }
}
