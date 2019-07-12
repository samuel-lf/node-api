import 'jest'
import * as request from 'supertest'

let address: string = (<any>global).address;

test('get /users', () => {
    return request(address).get('/users').then(response => {
        expect(response.status).toBe(200)
        expect(response.body.items).toBeInstanceOf(Array)
    }).catch(fail)

})

test('post /users', () => {
    return request(address).post('/users').send({
        name: 'usuario',
        email: 'usuario@email.com',
        password: '123456',
        cpf: '962.116.531-82'
    }).then(response => {
        expect(response.status).toBe(200)
        expect(response.body._id).toBeDefined()
        expect(response.body.name).toBe('usuario')
        expect(response.body.email).toBe('usuario@email.com')
        expect(response.body.cpf).toBe('962.116.531-82')
        expect(response.body.password).toBeUndefined()
    }).catch(fail)

})

test('get /users/aaaaaa -not found', () => {
    return request(address).get('/users/aaaaaa').then(response => {
        expect(response.status).toBe(404)
    }).catch(fail)

})

test('patch /users/:id', () => {
    return request(address).post('/users').send({
        name: 'usuario1',
        email: 'usuario1@email.com',
        password: '123456'
    }).then(response =>
        request(address).patch(`/users/${response.body._id}`).send({
            name: 'usuario_trocado'
        })
    ).then(res => {
        expect(res.status).toBe(200)
        expect(res.body._id).toBeDefined()
        expect(res.body.name).toBe('usuario_trocado')
        expect(res.body.email).toBe('usuario1@email.com')
        expect(res.body.password).toBeUndefined()
    }).catch(fail)
})
