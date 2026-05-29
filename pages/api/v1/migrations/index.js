import migrator from "models/migrator.js"

export default async function migrations(request, response) {
    const listedMigrations = await migrator.listPendingMigrations();
    
    return response.status(200).json(listedMigrations);
}