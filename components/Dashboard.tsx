import React from 'react';

const Dashboard = () => {
    return (
        <div className="w-full h-[calc(100vh-64px)] overflow-hidden">
            <iframe
                src="/admin/index.html"
                title="Content Manager Dashboard"
                className="w-full h-full border-none bg-slate-900"
            />
        </div>
    );
};

export default Dashboard;
