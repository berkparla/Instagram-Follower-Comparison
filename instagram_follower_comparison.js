// Function to get the CSRF token
function getCSRFToken() {
    const csrfToken = document.cookie.match(/csrftoken=([^;]+)/);
    if (csrfToken && csrfToken[1]) {
        return csrfToken[1];
    }
    throw new Error("Couldn't find CSRF token. Make sure you're logged in.");
}

// Function to get all followers or followings
async function getList(endpoint) {
    let list = [];
    let hasNext = true;
    let cursor = '';

    while (hasNext) {
        const response = await fetch(`${endpoint}${cursor}`, {
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'X-Instagram-AJAX': '1',
                'X-IG-App-ID': '936619743392459'
            }
        });
        const data = await response.json();
        list = list.concat(data.users);
        hasNext = data.next_max_id !== undefined;
        cursor = data.next_max_id ? `&max_id=${data.next_max_id}` : '';
    }

    return list.map(user => user.username);
}

// Main function to compare followers and followings
async function compareFollowersAndFollowings(userId) {
    const followersEndpoint = `/api/v1/friendships/${userId}/followers/?count=50`;
    const followingsEndpoint = `/api/v1/friendships/${userId}/following/?count=50`;

    console.log('Fetching followers...');
    const followers = await getList(followersEndpoint);
    console.log('Fetching followings...');
    const followings = await getList(followingsEndpoint);

    const notFollowingBack = followings.filter(username => !followers.includes(username));
    const youDontFollowBack = followers.filter(username => !followings.includes(username));

    console.log('Users not following you back:', notFollowingBack);
    console.log('Users you don\'t follow back:', youDontFollowBack);
}

// Prompt for user ID and run the comparison
const userId = prompt("Please enter your Instagram user ID:");
if (userId) {
    compareFollowersAndFollowings(userId).catch(error => console.error('An error occurred:', error));
} else {
    console.error('User ID is required to run this script.');
}
