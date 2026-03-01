import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';

const MembersList = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, name, branch, avatar_url')
                .order('name', { ascending: true });

            if (error) throw error;
            setMembers(data);
        } catch (err) {
            console.error('Error fetching members:', err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading members...</div>;

    return (
        <div className="members-container">
            <header className="members-header">
                <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
                <h1>Campus Connect Members</h1>
            </header>

            <div className="members-grid">
                {members.map((member) => (
                    <Link to={`/profile/${member.id}`} key={member.id} className="member-card">
                        <div className="member-avatar">
                            {member.avatar_url ? (
                                <img src={member.avatar_url} alt={member.name} />
                            ) : (
                                <div className="avatar-placeholder">{member.name?.charAt(0) || '?'}</div>
                            )}
                        </div>
                        <div className="member-info">
                            <h3>{member.name || 'Anonymous User'}</h3>
                            <p>{member.branch || 'No branch specified'}</p>
                        </div>
                    </Link>
                ))}
            </div>

            <style>{`
        .members-container { max-width: 1000px; margin: 0 auto; padding: 2rem; font-family: 'Inter', sans-serif; }
        .members-header { display: flex; align-items: center; gap: 2rem; margin-bottom: 2rem; }
        .back-link { color: #667eea; text-decoration: none; font-weight: 500; }
        .members-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; }
        .member-card { 
          background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; 
          text-decoration: none; color: inherit; transition: transform 0.2s, box-shadow 0.2s;
          display: flex; align-items: center; gap: 1rem;
        }
        .member-card:hover { transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .member-avatar img, .avatar-placeholder { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; }
        .avatar-placeholder { background: #edf2f7; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #718096; text-transform: uppercase; }
        h3 { margin: 0; font-size: 1.1rem; color: #2d3748; }
        p { margin: 0; font-size: 0.9rem; color: #718096; }
        .loading { text-align: center; padding: 3rem; color: #718096; }
      `}</style>
        </div>
    );
};

export default MembersList;
