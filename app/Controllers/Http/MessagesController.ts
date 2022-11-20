import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Message from 'App/Models/Message'
import MessageValidator from 'App/Validators/MessageValidator'

export default class MessagesController {

  public async index({ }: HttpContextContract) {
    const message = await Message
      .query()
      .preload('messageTopic')
      .preload('user')
      .orderBy('id')
    return message
  }

  public async store({ request, auth }: HttpContextContract) {
    const data = await request.validate(MessageValidator)
    const message = await Message.create({
      title: data.title,
      message: data.message,
      userId: auth.user?.id
    })
    await message.related('messageTopic').attach(data.topic)
    return message
  }

  public async show({ params, response }: HttpContextContract) {
    try {
      const message = await Message
        .query()
        .where("id", params.id)
        .preload('messageTopic')
      return message[0]
    } catch (error) {
      response.status(400).send("Mensagem não encontrada!!!")
    }
  }

  public async update({ request, params, response }: HttpContextContract) {
    try {
      const { title, message, topic } = await request.validate(MessageValidator)
      const messageUpdate = await Message.findOrFail(params.id)
      messageUpdate.title = title
      messageUpdate.message = message
      await messageUpdate.save()
      await messageUpdate.related('messageTopic').sync(topic)
      return messageUpdate
    } catch (error) {
      response.status(400).send("Mensagem não encontrada!!!")
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    try {
      const message = await Message.findOrFail(params.id)
      await message.delete()
      return message
    } catch (error) {
      response.status(400).send("Mensagem não encontrada!!!")
    }
  }
}
