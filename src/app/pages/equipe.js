import TeamMember from "@/components/TeamMember";

const teamData = [
  {
    name: "Ana Souza",
    position: "Cabeleireira",
    photo: "/images/equipe/1.png",
    socialLinks: [
      { name: "Instagram", url: "https://instagram.com/ana", iconClass: "fab fa-instagram" },
      { name: "LinkedIn", url: "https://linkedin.com/in/ana", iconClass: "fab fa-linkedin" },
    ],
  },
  {
    name: "Carlos Mendes",
    position: "Barbeiro",
    photo: "/images/equipe/3.png",
    socialLinks: [
      { name: "Instagram", url: "https://instagram.com/carlos", iconClass: "fab fa-instagram" },
    ],
  },
];

export default function Equipe() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-6">Nossa Equipe</h1>
      <div className="flex flex-wrap justify-center gap-6">
        {teamData.map((member, index) => (
          <TeamMember key={index} {...member} />
        ))}
      </div>
    </div>
  );
}