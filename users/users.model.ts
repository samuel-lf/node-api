const users = [
    {id: '1', name: 'User 1', email:'user1@email.com'},
    {id: '2', name: 'User 2', email:'user2@email.com'}
]

export class User {
    static findAll(): Promise<any[]> {
        return Promise.resolve(users);
    }

    static findById(id: string): Promise<any[]> {
        return new Promise(resolve => {
            const filtered = users.filter(user => user.id === id);
            let user = undefined;
            if(filtered.length > 0 ){
                user = filtered[0]
            }
            resolve(user);
        })
    }
}