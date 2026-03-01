
export async function onRequestGet(context: any) {
    const { request, env, params } = context;
    const url = new URL(request.url);
    const slug = params.slug;

    // Fetch the raw index.html from the build
    const response = await env.ASSETS.fetch(new Request(url.origin + '/index.html', request));
    let html = await response.text();

    try {
        // Here we ideally need to fetch all projects or get a specific project by slug
        // Since we don't have a direct "get project by slug" API without pulling all projects,
        // we'll fetch all and find it. In a real production environment with a DB, we'd query by slug directly.

        // Use a simpler fetch for the edge to just get the projects list JSON directly
        const projectsRes = await fetch('https://raw.githubusercontent.com/Yathindra-mestha/Campus_connect/main/data/projects.json', {
            headers: {
                'User-Agent': 'CampusConnect-Edge'
            }
        });

        if (projectsRes.ok) {
            const projects = await projectsRes.json();
            const project = projects.find((p: any) => p.slug === slug);

            if (project) {
                // Inject SEO Meta Tags natively using string replacement for speed
                html = html.replace(
                    /<title>.*?<\/title>/,
                    `<title>${project.title} | CampusConnect</title>`
                );
                html = html.replace(
                    /<meta name="description" content=".*?"\s*\/?>/,
                    `<meta name="description" content="${project.description}" />`
                );

                // Add OpenGraph Tags
                const ogTags = `
                    <meta property="og:title" content="${project.title} | CampusConnect" />
                    <meta property="og:description" content="${project.description}" />
                    ${project.image ? `<meta property="og:image" content="${project.image}" />` : ''}
                    <meta property="og:type" content="article" />
                    <meta name="twitter:card" content="summary_large_image" />
                `;

                html = html.replace('</head>', `${ogTags}</head>`);
            }
        }
    } catch (e) {
        console.error('Failed to inject SEO tags for project:', slug, e);
        // Fail silently and return original HTML, SPA handles the rest
    }

    return new Response(html, {
        headers: {
            'content-type': 'text/html;charset=UTF-8',
        },
    });
}
