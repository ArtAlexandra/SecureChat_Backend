export class CreateChat {
  participantIds: string[]; // ID участников (кроме текущего пользователя)
  isGroup?: boolean; // Флаг группового чата (по умолчанию false)
  groupName?: string; // Название группы (если isGroup = true)
}
