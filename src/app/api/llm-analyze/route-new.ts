import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { prompt, context, maxTokens = 1000 } = await request.json();
    
    console.log('🤖 收到LLM分析请求');
    console.log('📝 Context:', context);
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY未配置');
    }

    // 检查请求类型，简化处理逻辑
    const isTopicExtraction = context?.includes('topic');
    const isViewpointAnalysis = context?.includes('viewpoints');

    const systemContent = isTopicExtraction ? 
      '你是一个辩论主题提取专家。根据对话内容提取出简洁明确的辩论主题。直接返回主题，不要其他内容。' :
      isViewpointAnalysis ?
      '你是一个观点分析专家。分析发言内容，分类为正反方观点，并提取关键标签。必须返回标准JSON格式。' :
      '你是一个智能分析助手。根据用户要求进行分析并返回准确结果。';

    const requestBody: any = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemContent
        },
        {
          role: 'user', 
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: maxTokens
    };

    // 只有观点分析需要JSON格式
    if (isViewpointAnalysis) {
      requestBody.response_format = { type: "json_object" };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('LLM返回空内容');
    }

    console.log('🤖 LLM返回内容:', content);

    // 根据请求类型返回不同格式
    if (isTopicExtraction) {
      return NextResponse.json({ 
        result: content.trim().replace(/["""]/g, '') // 清理引号
      });
    } else if (isViewpointAnalysis) {
      try {
        const parsed = JSON.parse(content);
        return NextResponse.json({ result: parsed });
      } catch (parseError) {
        console.error('JSON解析失败:', content);
        return NextResponse.json({ 
          result: {
            positive: { viewpoint: 'Analysis error', tags: [] },
            negative: { viewpoint: 'Analysis error', tags: [] }
          }
        });
      }
    } else {
      // 默认返回原始内容
      return NextResponse.json({ result: content });
    }

  } catch (error) {
    console.error('❌ LLM分析API错误:', error);
    return NextResponse.json(
      { 
        error: 'LLM分析失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
