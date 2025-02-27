export default async function handler(req, res) {
    const url = `http://192.168.1.25:5001${req.url.replace(/^\/api/, "")}`;

    try {
        const response = await fetch(url, {
            method: req.method,
            headers: { ...req.headers, host: "" }, // Add/remove headers as needed.
            body: req.method === "GET" ? undefined : req.body,
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: "Something went wrong", details: error.message });
    }
}
