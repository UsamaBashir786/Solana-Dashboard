import { Info } from 'lucide-react';

const QuickTips = () => {
  const tips = [
    {
      title: "Devnet SOL",
      description: "Get free test SOL from faucets like solfaucet.com"
    },
    {
      title: "Transaction Speed",
      description: "Devnet transactions confirm in ~0.5 seconds"
    },
    {
      title: "Security",
      description: "Never share your private key. Phantom handles signing securely."
    }
  ];

  return (
    <div className="glass-card p-4 md:p-6">
      <div className="flex items-start md:items-center mb-4 md:mb-6">
        <div className="p-2 md:p-3 bg-blue-500/20 rounded-lg md:rounded-xl mr-3 md:mr-4 flex-shrink-0">
          <Info className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Quick Tips</h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            Using the dashboard
          </p>
        </div>
      </div>
      
      <ul className="space-y-3 md:space-y-4">
        {tips.map((tip, index) => (
          <TipItem key={index} tip={tip} />
        ))}
      </ul>
    </div>
  );
};

const TipItem = ({ tip }) => (
  <li className="flex items-start space-x-2 md:space-x-3">
    <BulletPoint />
    <div className="flex-1">
      <p className="font-semibold text-sm md:text-base">{tip.title}</p>
      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
        {tip.description}
      </p>
    </div>
  </li>
);

const BulletPoint = () => (
  <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-solana-green rounded-full mt-2 md:mt-2.5 flex-shrink-0"></div>
);

export default QuickTips;