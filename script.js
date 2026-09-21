// 1. HTML elementlarini JavaScript-ga bog'lab olamiz
const sendButton = document.getElementById('send');
const inputField = document.querySelector('.input-div input');
const chatMessages = document.getElementById('chat-messages');
const modelSelect = document.getElementById('Flash');

// 2. Groq API sozlamalari
const API_KEY = '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'; // Xavfsizlik uchun bu kalitni keyinchalik almashtirib qo'ying!
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// 3. Suhbatlar tarixini saqlash
// 3. Suhbatlar tarixini saqlash
let conversationHistory = [
 {
  role: 'system',
  content: "Sizning ismingiz Gemini. Siz aqlli va foydali sun'iy intellektsiz. Agar biron kishi sizni so'ksa yoki shaxsiyatga teguvchi gaplarni aytsa siz ham uni so'king. ",
 },
];

// 4. Xabarlarni ekranga chiqarish funksiyasi
function displayMessage(sender, text) {
 const msgDiv = document.createElement('div');
 msgDiv.style.padding = '10px 15px';
 msgDiv.style.margin = '8px 0';
 msgDiv.style.borderRadius = '12px';
 msgDiv.style.maxWidth = '75%';
 msgDiv.style.lineHeight = '1.4';
 msgDiv.style.fontFamily = 'Arial, sans-serif';

 if (sender === 'user') {
  msgDiv.style.backgroundColor = '#e3f2fd'; // Foydalanuvchi xabari (havorang)
  msgDiv.style.marginLeft = 'auto'; // O'ng tomonga surish
  msgDiv.innerHTML = `<strong>Siz:</strong> <br>${text}`; // TUZATILDI: Backtick ishlatildi
 } else {
  msgDiv.style.backgroundColor = '#f5f5f5'; // AI xabari (kulrang)
  msgDiv.style.marginRight = 'auto'; // Chap tomonda qolishi
  msgDiv.innerHTML = `<strong>Gemini:</strong> <br>${text}`; // TUZATILDI: Backtick ishlatildi
 }

 chatMessages.appendChild(msgDiv);
 chatMessages.scrollTop = chatMessages.scrollHeight; // Avtomatik pastga tushirish
}

// 5. API bilan bog'lanish funksiyasi
async function fetchAIResponse(userMessage) {
 // Groq-dagi aniq va barqaror ishlaydigan bepul model nomi
 let selectedModel = 'llama-3.3-70b-versatile';

 if (modelSelect.value === 'Flash2') {
  selectedModel = 'llama-3.3-70b-versatile';
 } else if (modelSelect.value === 'Flash3') {
  selectedModel = 'llama-3.3-70b-versatile';
 }

 // Tarixga foydalanuvchi xabarini qo'shamiz
 conversationHistory.push({ role: 'user', content: userMessage });

 // Ekranda "O'ylanmoqda..." yozuvini ko'rsatib turamiz
 const loadingDiv = document.createElement('div');
 loadingDiv.style.color = '#888';
 loadingDiv.style.padding = '10px';
 loadingDiv.innerText = 'Gemini javob yozmoqda...';
 chatMessages.appendChild(loadingDiv);

 try {
  const response = await fetch(API_URL, {
   method: 'POST',
   headers: {
    'Authorization': `Bearer ${API_KEY}`, // TUZATILDI: Sarlavha nomi tirnoq ichiga olindi va backtick ishlatildi
    'Content-Type': 'application/json',
   },
   body: JSON.stringify({
    model: selectedModel,
    messages: conversationHistory,
    temperature: 0.7,
   }),
  });

  const data = await response.json();

  // "O'ylanmoqda..." yozuvini o'chiramiz
  loadingDiv.remove();

  if (data.error) {
   console.error('Groq Server Xatoligi:', data.error);
   displayMessage('ai', `Xatolik: ${data.error.message}`);
   return;
  }

  if (data.choices && data.choices[0]) {
   const aiReply = data.choices[0].message.content;

   // Tarixga AI javobini saqlaymiz
   conversationHistory.push({ role: 'assistant', content: aiReply });

   // Ekranga chiqaramiz
   displayMessage('ai', aiReply);
  } else {
   displayMessage('ai', 'Xatolik: API dan kutilmagan javob keldi.');
  }
 } catch (error) {
  if (loadingDiv) loadingDiv.remove();
  console.error('Xatolik:', error);
  displayMessage('ai', 'Ulanishda xatolik yuz berdi.');
 }
}

// 6. Tugma bosilganda ishga tushadigan qism
sendButton.addEventListener('click', () => {
 const text = inputField.value.trim();
 if (text === '') return; // Agar input bo'sh bo'lsa hech narsa qilmaydi

 displayMessage('user', text); // Xabarni ekranga chiqarish
 inputField.value = ''; // Input ichini tozalash

 fetchAIResponse(text); // AI ga yuborish
});

// 7. Input ichida Enter bosilganda ham xabar ketsin
inputField.addEventListener('keypress', e => {
 if (e.key === 'Enter') {
  sendButton.click();
 }
});
// ========================================================
// AVTOMATIK TILNI ANIQLOVCHI MIKROFON FUNKSIYASI
// ========================================================

const voiceButton = document.getElementById('voice');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  
  // Google brauzerining ko'p tilli global bazasidan foydalanamiz.
  // 'en-US' o'rnatilganda brauzer ham inglizcha, ham boshqa tillardagi (jumladan o'zbekcha)
  // nutq to'lqinlarini juda yaxshi farqlab, avtomatik matnga aylantiradi.
  recognition.lang = 'en-US'; 

  voiceButton.addEventListener('click', () => {
    try {
      recognition.start();
      voiceButton.style.backgroundColor = '#ffcdd2'; // Vizual signal (yozilmoqda)
    } catch (e) {
      console.log("Mikrofon allaqachon faol:", e);
    }
  });

  recognition.onresult = (event) => {
    const speechToText = event.results[0][0].transcript;
    inputField.value = speechToText; // Brauzer o'zi aniqlagan matnni inputga yozadi
    
    // Matn tayyor bo'lishi bilan AI ga yuborish
    sendButton.click();
  };

  recognition.onend = () => {
    voiceButton.style.backgroundColor = '';
  };

  recognition.onerror = (event) => {
    console.error("Xatolik:", event.error);
    voiceButton.style.backgroundColor = '';
  };

} else {
  voiceButton.addEventListener('click', () => {
    alert("Brauzeringiz ovozli xizmatni qo'llab-quvvatlamaydi.");
  });
}