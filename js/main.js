// Creates an HTML element with optional text content and class
function createElemWithText(element = 'p', textContent = '', className) {
    const createdElement = document.createElement(element);
    createdElement.textContent = textContent;
    if (className) createdElement.className = className;
    return createdElement;
}

// Creates <option> elements for a select menu from user data
function createSelectOptions(users) {
    if (!Array.isArray(users)) return undefined;

    const optionsArray = [];

    for (const user of users) {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        optionsArray.push(option);
    }

    return optionsArray;
}

// Toggles the visibility of a post's comment section
function toggleCommentSection(postId) {
    if (postId === undefined) return undefined;
    const section = document.querySelector(`section[data-post-id="${postId}"]`);
    if (!section) return null;
    section.classList.toggle('hide');
    return section;
}

// Toggles a post's comment button text between "Show" and "Hide"
function toggleCommentButton(postId) {
    if (postId === undefined) return undefined;
    const button = document.querySelector(`button[data-post-id="${postId}"]`);
    if (!button) return null;
    button.textContent = button.textContent === 'Show Comments' ? 'Hide Comments' : 'Show Comments';
    return button;
}

// Removes all child elements of a given parent element
function deleteChildElements(parentElement) {
    if (!(parentElement instanceof HTMLElement)) return undefined;

    let child = parentElement.lastElementChild;
    while (child) {
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }
    return parentElement;
}

// Adds click listeners to all comment buttons in the main section
function addButtonListeners() {
    const buttons = document.querySelectorAll('main button');

    buttons.forEach(button => {
        const postId = button.dataset.postId;
        if (postId) {
            const listener = function (event) {
                toggleComments(event, postId);
            };
            button._toggleListener = listener;
            button.addEventListener('click', listener);
        }
    });

    return buttons;
}

// Removes previously added click listeners from comment buttons
function removeButtonListeners() {
    const buttons = document.querySelectorAll('main button');
    if (!buttons || buttons.length === 0) return buttons;

    buttons.forEach(button => {
        const postId = button.dataset.postId;
        if (postId && button._toggleListener) {
            button.removeEventListener('click', button._toggleListener);
            delete button._toggleListener;
        }
    });

    return buttons;
}

// Creates a document fragment containing comment articles
function createComments(comments) {
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

// Populates a <select> menu with user options
function populateSelectMenu(users) {
    if (!users) return undefined;

    const selectMenu = document.getElementById('selectMenu');
    if (!selectMenu) return undefined;

    const options = createSelectOptions(users);
    if (Array.isArray(options)) {
        options.forEach(option => selectMenu.appendChild(option));
    }

    return selectMenu;
}

// Fetches all users from the API
async function getUsers() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        return null;
    }
}

// Fetches posts for a specific user from the API
async function getUserPosts(userId) {
    if (userId === undefined) return undefined;
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching posts for user ${userId}:`, error);
        return null;
    }
}

// Fetches a single user's data from the API
async function getUser(userId) {
    if (userId === undefined) return undefined;
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        return null;
    }
}

// Fetches comments for a specific post from the API
async function getPostComments(postId) {
    if (postId === undefined) return undefined;
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching comments for post ${postId}:`, error);
        return null;
    }
}

// Creates a comment section element with fetched comments
async function displayComments(postId) {
    if (postId === undefined) return undefined;

    const section = document.createElement('section');
    section.dataset.postId = postId;
    section.classList.add('comments', 'hide');

    const comments = await getPostComments(postId);
    if (comments) {
        const fragment = createComments(comments);
        if (fragment) section.appendChild(fragment);
    }

    return section;
}

// Creates post elements with author info, comments, and buttons
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

        article.append(h2, pBody, pPostId, pAuthor, pCatchPhrase, button, section);
        fragment.appendChild(article);
    }

    return fragment;
}

// Displays all posts or a default message if none exist
async function displayPosts(posts) {
    const main = document.querySelector('main');
    if (!main) return undefined;

    const element = posts && posts.length
        ? await createPosts(posts)
        : createElemWithText('p', 'Select an Employee to display their posts.');

    if (!posts || posts.length === 0) {
        element.classList.add('default-text');
    }

    main.appendChild(element);
    return element;
}

// Handles comment toggling when a button is clicked
function toggleComments(event, postId) {
    if (!event || postId === undefined) return undefined;

    event.target.listener = true;

    const section = toggleCommentSection(postId);
    const button = toggleCommentButton(postId);

    return [section, button];
}

// Clears old posts, displays new posts, and rebinds event listeners
async function refreshPosts(posts) {
    if (!posts) return undefined;

    const removeButtons = removeButtonListeners();
    const main = document.querySelector('main');
    const mainElement = deleteChildElements(main);
    const fragment = await displayPosts(posts);
    const addButtons = addButtonListeners();

    return [removeButtons, mainElement, fragment, addButtons];
}

// Handles the change event of the select menu
async function selectMenuChangeEventHandler(event) {
    if (!event) return undefined;

    const selectMenu = event.target || document.getElementById('selectMenu');
    if (!selectMenu) return undefined;

    selectMenu.disabled = true;

    const rawValue = event.target && event.target.value;
    const userId = (rawValue && /^\d+$/.test(rawValue)) ? rawValue : 1;

    const posts = await getUserPosts(userId);
    const refreshPostsArray = await refreshPosts(posts);

    selectMenu.disabled = false;

    return [userId, posts, refreshPostsArray];
}

// Initializes the page by loading users and populating the select menu
async function initPage() {
    const users = await getUsers();
    const select = populateSelectMenu(users);
    return [users, select];
}

// Sets up the app and adds the select menu change listener
function initApp() {
    initPage();

    const selectMenu = document.getElementById('selectMenu');
    if (selectMenu) {
        selectMenu.addEventListener('change', selectMenuChangeEventHandler);
    }
}

// Run the app when the DOM content is loaded
document.addEventListener('DOMContentLoaded', initApp);
