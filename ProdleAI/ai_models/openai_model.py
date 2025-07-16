from openai import OpenAI

class OpenaiModel:
    def __init__(self, config):
        self.api_key = config["api_key"]
        self.client = OpenAI(api_key=self.api_key)
        self.model = config["model"]
        self.max_tokens = config["max_tokens"]
        self.temperature = config["temperature"]
        self.provider = "OpenAI"

    def convert_to_chat_messages(self, messages_list, user_role="user", assistant_role="assistant"):
        chat_messages = []
        for idx, message in enumerate(messages_list):
            role = user_role if idx % 2 == 0 else assistant_role
            chat_messages.append({"role": role, "content": message})
        return chat_messages

    def generate_response(self, system_message, messages):
        chat_messages = self.convert_to_chat_messages(messages)
        full_messages = [
            {"role": "system", "content": system_message},
            *chat_messages,
        ]

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=full_messages,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                n=1,
                stop=None,
            )

            content = response.choices[0].message.content.strip()
            input_tokens = response.usage.prompt_tokens if response.usage else 0
            output_tokens = response.usage.completion_tokens if response.usage else 0

            return {
                "output": content,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens
            }

        except Exception as e:
            raise Exception(f"OpenAI API request failed: {str(e)}")
