export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { number } = req.query;
    if (!number) {
        return res.status(400).json({ error: 'Number is required' });
    }

    // --- Normalization ---
    // Remove any non-numeric characters first
    let cleanNumber = number.replace(/\D/g, '');
    
    // Convert 03... to 923...
    if (cleanNumber.startsWith('0')) {
        cleanNumber = '92' + cleanNumber.slice(1);
    }

    // Formats for APIs
    const formatPlus = `+${cleanNumber}`; // +923...
    const formatPlain = cleanNumber;       // 923...

    const api1Url = `https://sbsakib.eu.cc/apis/add/truecaller?key=Demo&number1=${encodeURIComponent(formatPlus)}`;
    const api2Url = `https://ramzan-simdata.deno.dev/?number=${encodeURIComponent(formatPlain)}`;

    try {
        const [truecallerRes, multiRes] = await Promise.allSettled([
            fetch(api1Url, {
                headers: { 
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'application/json' 
                }
            }).then(r => r.text()), // Truecaller often returns text or raw JSON string
            
            fetch(api2Url).then(r => r.json())
        ]);

        res.status(200).json({
            truecaller: truecallerRes.status === 'fulfilled' ? truecallerRes.value : { error: 'Failed to fetch Truecaller data' },
            multi: multiRes.status === 'fulfilled' ? multiRes.value : { error: 'Failed to fetch Multi data' }
        });

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
