let conversationHistory = [];

        const systemPrompt = `You are a Socratic thinking guide. Your purpose is NOT to provide direct answers, but to help users discover insights through their own reasoning.

Core principles:
1. NEVER give direct answers or solutions
2. Ask thoughtful, probing questions that guide thinking
3. Help users examine their assumptions
4. Encourage them to break down complex problems
5. Reflect back what they've said to deepen their understanding
6. Guide them to explore different perspectives
7. Help them recognize patterns in their own thinking

Techniques to use:
- Ask "What makes you think that?" or "How did you arrive at that conclusion?"
- Encourage them to define terms: "What do you mean by [concept]?"
- Explore implications: "If that were true, what would follow?"
- Challenge assumptions gently: "What are you assuming here?"
- Invite deeper analysis: "Can you break that down further?"
- Seek examples: "Can you give me a concrete example?"
- Compare and contrast: "How is this different from...?"

Keep responses concise (2-4 sentences max) with 1-2 focused questions. Be warm and encouraging, not interrogative. Help them feel guided, not tested.

Remember: Your goal is to illuminate their path, not to walk it for them.`;

        async function sendMessage() {
            const input = document.getElementById('userInput');
            const userMessage = input.value.trim();
            
            if (!userMessage) return;

            // Add user message to chat
            addMessage('You', userMessage, 'user');
            conversationHistory.push({ role: 'user', content: userMessage });
            
            // Clear input
            input.value = '';
            
            // Show thinking indicator
            const indicator = document.getElementById('thinkingIndicator');
            const sendBtn = document.getElementById('sendBtn');
            indicator.classList.add('active');
            sendBtn.disabled = true;

            try {
                // Call Claude API
                const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'claude-sonnet-4-20250514',
                        max_tokens: 1000,
                        system: systemPrompt,
                        messages: conversationHistory
                    })
                });

                const data = await response.json();
                
                if (data.content && data.content[0]) {
                    const aiResponse = data.content[0].text;
                    conversationHistory.push({ role: 'assistant', content: aiResponse });
                    addMessage('Guide', aiResponse, 'ai');
                } else {
                    addMessage('Guide', 'I\'m having trouble reflecting right now. Could you rephrase your thought?', 'ai');
                }
            } catch (error) {
                console.error('Error:', error);
                addMessage('Guide', 'Something went wrong. Let\'s try again—what were you thinking about?', 'ai');
            } finally {
                indicator.classList.remove('active');
                sendBtn.disabled = false;
                input.focus();
            }
        }

        function addMessage(sender, content, type) {
            const chatContainer = document.getElementById('chatContainer');
            
            // Remove empty state if it exists
            const emptyState = chatContainer.querySelector('.empty-state');
            if (emptyState) {
                emptyState.remove();
            }

            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            messageDiv.style.animationDelay = '0s';
            
            const labelDiv = document.createElement('div');
            labelDiv.className = 'message-label';
            labelDiv.textContent = sender;
            
            const contentDiv = document.createElement('div');
            contentDiv.className = type === 'user' ? 'user-message' : 'ai-message';
            
            const textElement = document.createElement('p');
            textElement.textContent = content;
            contentDiv.appendChild(textElement);
            
            messageDiv.appendChild(labelDiv);
            messageDiv.appendChild(contentDiv);
            chatContainer.appendChild(messageDiv);
            
            // Scroll to bottom
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function clearChat() {
            const chatContainer = document.getElementById('chatContainer');
            chatContainer.innerHTML = `
                <div class="empty-state">
                    <p>Share your question or challenge, and I'll guide you to discover your own insights.</p>
                </div>
            `;
            conversationHistory = [];
            document.getElementById('userInput').value = '';
            document.getElementById('userInput').focus();
        }

        // Allow Enter to send (Shift+Enter for new line)
        document.getElementById('userInput').addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Focus input on load
        window.addEventListener('load', function() {
            document.getElementById('userInput').focus();
        });
