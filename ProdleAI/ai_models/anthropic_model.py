import base64
import anthropic
import traceback

class ClaudeModel:
    def __init__(self, config):
        self.api_key = config["api_key"]
        self.model = "claude-3-5-sonnet-20240620"
        self.max_tokens = config["max_tokens"]
        self.temperature = config["temperature"]
        self.client = anthropic.Anthropic(api_key=self.api_key)
        self.provider = "anthropic"

    def convert_to_chat_messages(self, messages_list, user_role="user", assistant_role="assistant"):
        chat_messages = []
        for idx, message in enumerate(messages_list):
            role = user_role if idx % 2 == 0 else assistant_role
            chat_messages.append({"role": role, "content": message})
        return chat_messages

    def generate_response(self, system_message, messages):
        try:
            chat_messages = self.convert_to_chat_messages(messages)
            print("chat messages in generate response claude model", chat_messages)

            response = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                system=system_message,
                messages=chat_messages
            )

            content = response.content[0].text
            input_tokens = response.usage.input_tokens if response.usage else 0
            output_tokens = response.usage.output_tokens if response.usage else 0

            return {
                "output": content,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens
            }

        except Exception as e:
            raise Exception(f"Claude API request failed: {str(e)}")

    def describe_image_anthropic(self, image_path, prompt, media_type='image/jpeg'):
        try:
            with open(image_path, "rb") as image_file:
                image_data = base64.b64encode(image_file.read()).decode("utf-8")

            message = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                system=prompt,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": media_type,
                                    "data": image_data,
                                }
                            }
                        ],
                    }
                ],
            )

            content = message.content[0].text
            input_tokens = message.usage.input_tokens if message.usage else 0
            output_tokens = message.usage.output_tokens if message.usage else 0

            return {
                "output": content,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "output": None,
                "input_tokens": 0,
                "output_tokens": 0
            }
