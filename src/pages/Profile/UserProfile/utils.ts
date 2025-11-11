export const getLocation = (city?: string, country?: string) => {
    const parts = [];
    if (city) parts.push(city);
    if (country) parts.push(country);
    return parts.length > 0 ? parts.join(", ") : "Non renseigné";
};