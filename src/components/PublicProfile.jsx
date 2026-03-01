import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const PublicProfile = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (err) {
            console.error('Error fetching profile:', err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading profile...</div>;
    if (!profile) return <div className="error">User not found.</div>;

    return (
        <div className="profile-view-container">
            <header className="profile-header">
                <Link to="/members" className="back-link">← Back to Members</Link>
            </header>

            <div className="profile-card-large">
                <div className="profile-banner"></div>
                <div className="profile-content">
                    <div className="profile-main-info">
                        <div className="profile-img-large">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.name} />
                            ) : (
                                <div className="avatar-placeholder-large">{profile.name?.charAt(0) || '?'}</div>
                            )}
                        </div>
                        <h1>{profile.name}</h1>
                        <p className="branch-tag">{profile.branch || 'Student'}</p>
                        <p className="email-text">{profile.email}</p>
                    </div>

                    <div className="social-section">
                        <h3>Connect with {profile.name?.split(' ')[0]}</h3>
                        <div className="social-links-grid">
                            {profile.social_links?.linkedin ? (
                                <a href={profile.social_links.linkedin} target="_blank" rel="noreferrer" className="social-btn linkedin">LinkedIn</a>
                            ) : null}
                            {profile.social_links?.github ? (
                                <a href={profile.social_links.github} target="_blank" rel="noreferrer" className="social-btn github">GitHub</a>
                            ) : null}
                            {profile.social_links?.instagram ? (
                                <a href={profile.social_links.instagram} target="_blank" rel="noreferrer" className="social-btn instagram">Instagram</a>
                            ) : null}
                            {!profile.social_links?.linkedin && !profile.social_links?.github && !profile.social_links?.instagram && (
                                <p className="no-socials">No social links provided.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .profile-view-container { max-width: 800px; margin: 0 auto; padding: 2rem; font-family: 'Inter', sans-serif; }
        .profile-header { margin-bottom: 2rem; }
        .back-link { color: #667eea; text-decoration: none; font-weight: 500; }
        .profile-card-large { background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .profile-banner { height: 120px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .profile-content { padding: 0 2rem 2rem; text-align: center; }
        .profile-main-info { margin-top: -60px; margin-bottom: 2rem; }
        .profile-img-large img, .avatar-placeholder-large { 
          width: 120px; height: 120px; border-radius: 50%; border: 4px solid white; 
          margin: 0 auto 1.5rem; object-fit: cover; background: white;
        }
        .avatar-placeholder-large { background: #edf2f7; display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: 600; color: #718096; text-transform: uppercase; }
        h1 { margin: 0 0 0.5rem; color: #2d3748; }
        .branch-tag { color: #667eea; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.85rem; margin-bottom: 0.5rem; }
        .email-text { color: #718096; margin-bottom: 1.5rem; }
        .social-section { border-top: 1px solid #edf2f7; padding-top: 2rem; }
        .social-section h3 { margin-bottom: 1.5rem; color: #4a5568; font-size: 1.1rem; }
        .social-links-grid { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; }
        .social-btn { padding: 0.8rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.95rem; transition: background 0.2s; color: white; }
        .linkedin { background: #0077b5; }
        .github { background: #24292e; }
        .instagram { background: #e1306c; }
        .no-socials { color: #a0aec0; font-style: italic; }
        .loading, .error { text-align: center; padding: 5rem; color: #718096; }
      `}</style>
        </div>
    );
};

export default PublicProfile;
