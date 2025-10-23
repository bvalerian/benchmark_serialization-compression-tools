// Pre-generate a deterministic dataset to avoid recalculating for every request
function generatePayload(recordsCount = 100_000) {
    const records = Array.from({ length: recordsCount }, (_, index) => ({
        id: index + 1,
        title: `Record ${index + 1}`,
        category: `Category ${index % 10}`,
        score: (index * 13) % 997,
        active: index % 2 === 0
    }));
    const payload = {
        generatedAt: new Date().toISOString(),
        records
    };
    return payload
}

module.exports = { generatePayload };