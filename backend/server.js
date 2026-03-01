import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

// 1. Initial login route - Redirects to GitHub
app.get('/auth/github', (req, res) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GITHUB_CALLBACK_URL)}&scope=read:user,user:email`;
    res.redirect(githubAuthUrl);
});

// 2. Callback route - GitHub redirects here with 'code'
app.get('/auth/github/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('No code provided');
    }

    try {
        // Exchange code for access token
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: process.env.GITHUB_CALLBACK_URL
        }, {
            headers: {
                Accept: 'application/json'
            }
        });

        const accessToken = tokenResponse.data.access_token;

        if (!accessToken) {
            console.error('No access token received from GitHub', tokenResponse.data);
            return res.redirect(`${process.env.FRONTEND_URL}?error=github_auth_failed`);
        }

        // Redirect to frontend dashboard with token
        res.redirect(`${process.env.FRONTEND_URL}?access_token=${accessToken}`);

    } catch (error) {
        console.error('GitHub auth error:', error.response?.data || error.message);
        res.redirect(`${process.env.FRONTEND_URL}?error=github_auth_error`);
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
