#!/usr/bin/env node
/**
 * AI診断 エンドツーエンドテスト
 * 環境変数 → Claude API → JSON パース を全段階でテスト
 */

const Anthropic = require('@anthropic-ai/sdk').default;

async function testAiDiagnosis() {
  console.log('🧪 AI診断 エンドツーエンドテスト開始\n');

  // ステップ1: 環境変数確認
  console.log('【ステップ1: 環境変数確認】');
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY が設定されていません');
    console.error('   .env.local ファイルを確認してください');
    process.exit(1);
  }
  console.log(`✅ ANTHROPIC_API_KEY が設定されています（先頭8文字: ${apiKey.substring(0, 8)}...）\n`);

  // ステップ2: Anthropic クライアント作成
  console.log('【ステップ2: Anthropic クライアント作成】');
  try {
    const client = new Anthropic({ apiKey });
    console.log('✅ Anthropic クライアント作成成功\n');
  } catch (err) {
    console.error('❌ クライアント作成失敗:', err.message);
    process.exit(1);
  }

  // ステップ3: Claude API 呼び出し（シンプルなテスト）
  console.log('【ステップ3: Claude API 呼び出しテスト】');
  try {
    const client = new Anthropic({ apiKey });
    const testPrompt = 'こんにちは。テスト用のシンプルな応答をJSON形式で返してください。{"status": "ok", "message": "テスト成功"}';

    console.log('📤 Claude API にリクエスト送信中...');
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{ role: 'user', content: testPrompt }],
    });

    console.log(`✅ Claude API から応答を受け取りました`);
    console.log(`   Content blocks: ${message.content.length}`);

    const rawText = message.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    console.log(`   応答テキスト長: ${rawText.length} 文字`);
    console.log(`   応答内容（先頭200文字）:\n   ${rawText.substring(0, 200)}\n`);

    // ステップ4: JSON 抽出テスト
    console.log('【ステップ4: JSON 抽出テスト】');
    const jsonMatch = rawText.match(/\{[\s\S]*}/);
    if (!jsonMatch) {
      console.error('❌ JSON 抽出失敗');
      console.error(`   応答全文: ${rawText}`);
      process.exit(1);
    }

    console.log(`✅ JSON 抽出成功`);
    const jsonStr = jsonMatch[0];
    console.log(`   抽出JSON長: ${jsonStr.length} 文字`);
    console.log(`   抽出JSON（先頭150文字）:\n   ${jsonStr.substring(0, 150)}\n`);

    // ステップ5: JSON パーステスト
    console.log('【ステップ5: JSON パーステスト】');
    try {
      const parsed = JSON.parse(jsonStr);
      console.log(`✅ JSON パース成功`);
      console.log(`   キー数: ${Object.keys(parsed).length}`);
      console.log(`   パース結果: ${JSON.stringify(parsed, null, 2).substring(0, 300)}\n`);
    } catch (parseErr) {
      console.error(`❌ JSON パース失敗: ${parseErr.message}`);
      console.error(`   パース試行JSON: ${jsonStr.substring(0, 500)}`);
      process.exit(1);
    }

    console.log('🎉 全テスト成功！ AI診断は正常に動作しています');
  } catch (err) {
    console.error('❌ Claude API 呼び出し失敗');
    console.error(`   エラー: ${err.message}`);
    if (err.status) console.error(`   ステータス: ${err.status}`);
    if (err.error) console.error(`   詳細: ${JSON.stringify(err.error, null, 2)}`);
    process.exit(1);
  }
}

testAiDiagnosis().catch(err => {
  console.error('❌ 予期しないエラー:', err);
  process.exit(1);
});
