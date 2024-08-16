import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import OpenAI from 'openai';
import { authConfig } from 'src/core/config/auth.config';

const PROMPT = `
<요청> 다음 Message 를 읽고, 해당 메시지가 [어떤 질문에 대한 응답] 인지 알려주세요. 즉, 해당 응답에 어울릴 만한 질문이 무엇인지 답변 하는 것이 요청 입니다.

<배경> 
- GPT의 응답만을 저장하였고, 이 답변을 토대로 역으로 질문이 무엇인지 알고 싶음
- 이 [질문] 값을 저장한 데이터 컬럼의 Title 로 저장할 것임 메시지는 이미 Description 으로 저장되어있음
- 메시지의 맥락이 분명하지 않다면, 가장 일반적인 상황을 가정하여 질문을 유추할 것

<기본 지식>
- 카테고리는 총 21개 [개발, 마케팅, 인사이트, 학습, 언어, 기획, 업무, 이론, 디자인, 단순질문, 문제 해결, 창의성, 생산성, 커뮤니케이션, 트렌드, 결정, 미래 전망, 문화, 윤리, 혁신, 자기계발] 임

<응답> - 아래의 형식대로 출력할 것 (중괄호는 Your Answer 임) / 답변은 간단하게
- [{질문이 해당 하는 카테고리}] {추측한 질문}

<예시>
- 메시지: "다음 단어를 영어로 번역해 주세요: '안녕하세요'"
- 응답: [언어] "안녕하세요"를 영어로 어떻게 번역하나요?
`;

@Injectable()
export class OpenaiService {
  openai: OpenAI;
  constructor(
    @Inject(authConfig.KEY)
    private config: ConfigType<typeof authConfig>,
  ) {
    this.openai = new OpenAI({ apiKey: this.config.auth.openAiAPIKey });
  }

  useOpenAPI() {
    const getTitle = async (description: string) => {
      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: PROMPT,
          },
          { role: 'user', content: description },
        ],
        model: 'gpt-4o-mini',
        temperature: 1,
        max_tokens: 258,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        response_format: {
          type: 'text',
        },
      });

      return { ...completion.choices[0] };
    };

    return { getTitle };
  }
}
