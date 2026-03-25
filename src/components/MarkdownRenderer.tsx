import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <div className="prose prose-invert prose-lg max-w-none
      prose-headings:text-white prose-headings:font-bold
      prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
      prose-p:text-gray-300 prose-p:leading-relaxed
      prose-a:text-red-400 prose-a:no-underline hover:prose-a:underline
      prose-strong:text-white
      prose-blockquote:border-red-500 prose-blockquote:text-gray-300 prose-blockquote:bg-white/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg
      prose-li:text-gray-300
      prose-img:rounded-xl prose-img:shadow-2xl prose-img:mx-auto
      prose-code:text-red-300 prose-code:bg-white/5 prose-code:px-1 prose-code:rounded
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
