const TeamMember = ({ name, position, photo, socialLinks }) => (
    <div className="flex flex-col items-center p-4 bg-white shadow-lg rounded-2xl w-64">
      <img src={photo} alt={name} className="w-24 h-24 rounded-full mb-3" />
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-gray-500">{position}</p>
      <div className="flex gap-3 mt-2">
        {socialLinks.map((link) => (
          <a href={link.url} key={link.name} target="_blank" rel="noopener noreferrer">
            <i className={`text-xl ${link.iconClass} text-blue-500`} />
          </a>
        ))}
      </div>
    </div>
  );
  
  export default TeamMember;