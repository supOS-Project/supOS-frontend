import { makeAutoObservable } from 'mobx';

interface AiResultProps {
  [key: string]: any;
}

export class AiStore {
  aiResult?: AiResultProps;
  aiOperationName?: string;
  constructor() {
    makeAutoObservable(this);
  }

  setAiResult(key: string, result?: any) {
    this.aiResult = { ...this.aiResult, [key]: result };
  }

  setAiOperationName(name: string) {
    this.aiOperationName = name;
  }
}

export default new AiStore();
