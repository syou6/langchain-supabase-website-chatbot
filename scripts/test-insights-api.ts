/**
 * 分析APIの動作確認スクリプト
 * 
 * 使用方法:
 * npm run test:insights
 * または
 * tsx -r dotenv/config scripts/test-insights-api.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('環境変数が設定されていません');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '設定済み' : '未設定');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '設定済み' : '未設定');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsightsAPI() {
  console.log('🔍 分析APIの動作確認を開始します...\n');

  // 1. ログイン（テスト用のユーザーでログインする必要があります）
  console.log('1. 認証チェック...');
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();

  if (authError || !session) {
    console.error('❌ 認証エラー:', authError?.message || 'セッションがありません');
    console.log('\n💡 ヒント: まずブラウザでログインしてから、このスクリプトを実行してください');
    return;
  }

  console.log('✅ 認証成功\n');

  // 2. サイト一覧を取得
  console.log('2. サイト一覧を取得...');
  const { data: sites, error: sitesError } = await supabase
    .from('sites')
    .select('id, name, user_id')
    .eq('user_id', session.user.id)
    .limit(1);

  if (sitesError || !sites || sites.length === 0) {
    console.error('❌ サイトが見つかりません:', sitesError?.message);
    return;
  }

  const siteId = sites[0].id;
  console.log(`✅ サイトを取得: ${sites[0].name} (ID: ${siteId})\n`);

  // 3. 質問ランキングAPIのテスト
  console.log('3. 質問ランキングAPIをテスト...');
  try {
    const questionsRes = await fetch(
      `http://localhost:3000/api/insights/questions?site_id=${siteId}&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    );

    if (!questionsRes.ok) {
      const errorData = await questionsRes.json();
      console.error('❌ エラー:', questionsRes.status, errorData);
    } else {
      const questionsData = await questionsRes.json();
      console.log('✅ 質問ランキング取得成功');
      console.log(`   取得件数: ${questionsData.questions?.length || 0}件`);
      if (questionsData.questions && questionsData.questions.length > 0) {
        console.log('   TOP 3:');
        questionsData.questions.slice(0, 3).forEach((q: any, i: number) => {
          console.log(`   ${i + 1}. ${q.question} (${q.count}回)`);
        });
      }
    }
  } catch (error) {
    console.error('❌ リクエストエラー:', error);
    console.log('💡 ヒント: 開発サーバーが起動しているか確認してください (npm run dev)');
  }

  console.log('');

  // 4. キーワード分析APIのテスト
  console.log('4. キーワード分析APIをテスト...');
  try {
    const keywordsRes = await fetch(
      `http://localhost:3000/api/insights/keywords?site_id=${siteId}&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    );

    if (!keywordsRes.ok) {
      const errorData = await keywordsRes.json();
      console.error('❌ エラー:', keywordsRes.status, errorData);
    } else {
      const keywordsData = await keywordsRes.json();
      console.log('✅ キーワード分析取得成功');
      console.log(`   取得件数: ${keywordsData.keywords?.length || 0}件`);
      if (keywordsData.keywords && keywordsData.keywords.length > 0) {
        console.log('   TOP 5:');
        keywordsData.keywords.slice(0, 5).forEach((kw: any, i: number) => {
          console.log(`   ${i + 1}. ${kw.keyword} (${kw.count}回)`);
        });
      }
    }
  } catch (error) {
    console.error('❌ リクエストエラー:', error);
  }

  console.log('');

  // 5. 時系列分析APIのテスト
  console.log('5. 時系列分析APIをテスト...');
  try {
    const timelineRes = await fetch(
      `http://localhost:3000/api/insights/timeline?site_id=${siteId}&interval=day`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    );

    if (!timelineRes.ok) {
      const errorData = await timelineRes.json();
      console.error('❌ エラー:', timelineRes.status, errorData);
    } else {
      const timelineData = await timelineRes.json();
      console.log('✅ 時系列分析取得成功');
      console.log(`   取得件数: ${timelineData.timeline?.length || 0}件`);
      if (timelineData.timeline && timelineData.timeline.length > 0) {
        console.log('   最新5件:');
        timelineData.timeline.slice(-5).forEach((item: any) => {
          const date = new Date(item.period_start).toLocaleDateString('ja-JP');
          console.log(`   ${date}: ${item.question_count}件`);
        });
      }
    }
  } catch (error) {
    console.error('❌ リクエストエラー:', error);
  }

  console.log('\n✅ すべてのテストが完了しました！');
}

testInsightsAPI().catch(console.error);

