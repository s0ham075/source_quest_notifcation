const express = require('express');
const app = express();
require('dotenv').config();

const generate_llm_message = (input ) =>{
    final_result = "";
    const url = 'https://api.together.xyz/v1/chat/completions';
    const apiKey = process.env.TOGETHER_API_KEY;

    const headers = new Headers({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
    });
const llm_data = {
    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    max_tokens: 1024,
    messages: [
    {
        role: 'system',
        content: `if you recieve the code You are supposed to summarize the code ,
        if you recieve issue you are supposed to explain the issue in a very clear and consize form
        in the following manner
        1} explain the issue
        2} explain very high level steps to solve its`
    },
    {
        role: 'user',
        content: `${input}`
    }
    ]
};

const options = {
    method: 'POST',
    headers,
    body: JSON.stringify(llm_data)
};
fetch(url, options)
   .then(response => response.json())
   .then(result => {
      final_result = result.choices;
      console.log(final_result);
   })
   .catch(error => {
   console.error('Error:', error);
   });

   return final_result;
}

app.post('/webhook', express.json({type: 'application/json'}), (request, response) => {
  response.status(202).send('Accepted');
  const githubEvent = request.headers['x-github-event'];
  if (githubEvent === 'issues') {
    const data = request.body;
    const action = data.action;
    if (action === 'opened') {
        
        console.log(generate_llm_message(`${data.issue.title} ${data.issue.body}`).message.content);
    } else if (action === 'closed') {
      console.log(`An issue was closed by ${data.issue.user.login}`);
    } else if (action === 'reopened') {
        console.log("hello")
        console.log(generate_llm_message(`${data.issue.title} ${data.issue.body}`).message.content);
        
    } else {
      console.log(`Unhandled action for the issue event: ${action}`);
    }
  } else if (githubEvent === 'ping') {
    console.log('GitHub sent the ping event');
  } else {
    console.log(`Unhandled event: ${githubEvent}`);
  }
});

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
